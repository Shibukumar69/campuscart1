import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Shop } from '../models/Shop.js';
import { EmailOtp } from '../models/EmailOtp.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, generateDeliveryOtp, verifyOtpHash } from '../utils/tokens.js';
import { sendPasswordResetOtpEmail, sendLoginOtpEmail, sendSignupOtpEmail } from '../services/emailService.js';

export const sendSignupOtp = async (req, res, next) => {
  try {
    const { email, name } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists. Please sign in.' });
    }

    const { otp, otpHash } = generateDeliveryOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await EmailOtp.deleteMany({ email: email.toLowerCase(), purpose: 'SIGNUP' });
    await EmailOtp.create({
      email: email.toLowerCase(),
      otpHash,
      purpose: 'SIGNUP',
      expiresAt,
    });

    const emailResult = await sendSignupOtpEmail({ toEmail: email.toLowerCase(), userName: name || 'Student', otp });

    res.json({
      success: true,
      message: emailResult?.delivered
        ? 'A 6-digit verification code has been sent to your Gmail.'
        : 'Verification code generated! (Check your Gmail or use code in dev mode)',
      data: {
        email: email.toLowerCase(),
        expiresInMinutes: 10,
        devOtp: (!emailResult?.delivered || process.env.NODE_ENV === 'test') ? otp : undefined,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, otp, phone, role, collegeId, hostelBlock, roomNumber, shopDetails } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    // Verify Email OTP if provided
    if (otp) {
      const otpRecord = await EmailOtp.findOne({ email: email.toLowerCase(), purpose: 'SIGNUP' });
      if (!otpRecord) {
        return res.status(400).json({ success: false, message: 'No active verification code found for this email. Please request a new code.' });
      }

      if (new Date() > otpRecord.expiresAt) {
        return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
      }

      const isValid = verifyOtpHash(otp.trim(), otpRecord.otpHash);
      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Invalid 6-digit verification code. Please check your Gmail.' });
      }

      // Cleanup used OTP
      await EmailOtp.deleteMany({ email: email.toLowerCase(), purpose: 'SIGNUP' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const targetRole = ['STUDENT', 'SHOP_OWNER', 'DELIVERY_AGENT'].includes(role) ? role : 'STUDENT';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      passwordHash,
      role: targetRole,
      collegeId: collegeId || '',
      hostelBlock: hostelBlock || '',
      roomNumber: roomNumber || '',
      addresses: hostelBlock ? [{ hostelBlock, roomNumber, isDefault: true }] : [],
    });

    let createdShop = null;
    // If shop owner, register shop
    if (targetRole === 'SHOP_OWNER') {
      createdShop = await Shop.create({
        name: shopDetails?.name || `${name}'s Stationery Hub`,
        ownerId: user._id,
        description: shopDetails?.description || 'Campus stationery and quick print services',
        campusLocation: shopDetails?.campusLocation || 'Student Amenity Complex',
        approvalStatus: 'APPROVED', // auto-approved for smooth demonstration
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        user: user.toJSON(),
        shop: createdShop,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact administrator.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    let shop = null;
    if (user.role === 'SHOP_OWNER') {
      shop = await Shop.findOne({ ownerId: user._id });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    res.json({
      success: true,
      message: 'Signed in successfully.',
      data: {
        user: user.toJSON(),
        shop,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required.' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or inactive.' });
    }

    const tokenExists = user.refreshTokens.some((t) => t.token === refreshToken);
    if (!tokenExists) {
      return res.status(403).json({ success: false, message: 'Invalid or revoked refresh token.' });
    }

    // Rotate refresh token
    user.refreshTokens = user.refreshTokens.filter((t) => t.token !== refreshToken);
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    user.refreshTokens.push({ token: newRefreshToken });
    await user.save();

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Refresh token expired or invalid.' });
  }
};

export const getMe = async (req, res, next) => {
  try {
    let shop = null;
    if (req.user.role === 'SHOP_OWNER') {
      shop = await Shop.findOne({ ownerId: req.user._id });
    }

    res.json({
      success: true,
      data: {
        user: req.user.toJSON(),
        shop,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken && req.user) {
      req.user.refreshTokens = req.user.refreshTokens.filter((t) => t.token !== refreshToken);
      await req.user.save();
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Request Password Reset OTP via Gmail
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your registered email address.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered account found with this email address.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'This account has been deactivated. Please contact support.' });
    }

    const { otp, otpHash } = generateDeliveryOtp();
    user.resetPasswordOtp = otpHash;
    user.resetPasswordOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    const emailResult = await sendPasswordResetOtpEmail({ toEmail: user.email, userName: user.name, otp });

    res.json({
      success: true,
      message: emailResult?.delivered
        ? 'A 6-digit verification code has been sent to your Gmail.'
        : 'Verification code generated! (Check your Gmail or use code in dev mode)',
      data: {
        email: user.email,
        expiresInMinutes: 10,
        devOtp: (!emailResult?.delivered || process.env.NODE_ENV === 'test') ? otp : undefined,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify 6-digit Reset OTP
 */
export const verifyResetOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and 6-digit OTP code are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+resetPasswordOtp +resetPasswordOtpExpires');
    if (!user || !user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
      return res.status(400).json({ success: false, message: 'No active password reset request found. Please request a new code.' });
    }

    if (new Date() > user.resetPasswordOtpExpires) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
    }

    const isValid = verifyOtpHash(otp.trim(), user.resetPasswordOtp);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Incorrect 6-digit verification code.' });
    }

    res.json({
      success: true,
      message: 'OTP verified successfully. You can now set your new password.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset Password with Verified OTP
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash +resetPasswordOtp +resetPasswordOtpExpires');
    if (!user || !user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
      return res.status(400).json({ success: false, message: 'No active password reset request. Please request a new code.' });
    }

    if (new Date() > user.resetPasswordOtpExpires) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
    }

    const isValid = verifyOtpHash(otp.trim(), user.resetPasswordOtp);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid 6-digit verification code.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    user.refreshTokens = []; // Revoke previous sessions
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request Passwordless Login OTP via Gmail
 */
export const sendLoginOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email. Please register first.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact administrator.' });
    }

    const { otp, otpHash } = generateDeliveryOtp();
    user.loginOtp = otpHash;
    user.loginOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    const emailResult = await sendLoginOtpEmail({ toEmail: user.email, userName: user.name, otp });

    res.json({
      success: true,
      message: emailResult?.delivered
        ? 'A 6-digit login code has been sent to your Gmail.'
        : 'Login code generated! (Check your Gmail or use code in dev mode)',
      data: {
        email: user.email,
        expiresInMinutes: 10,
        devOtp: (!emailResult?.delivered || process.env.NODE_ENV === 'test') ? otp : undefined,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login directly with 6-digit Gmail OTP
 */
export const loginWithOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and 6-digit OTP code are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+loginOtp +loginOtpExpires');
    if (!user || !user.loginOtp || !user.loginOtpExpires) {
      return res.status(400).json({ success: false, message: 'No active login request found. Please request a new code.' });
    }

    if (new Date() > user.loginOtpExpires) {
      return res.status(400).json({ success: false, message: 'Login code has expired. Please request a new code.' });
    }

    const isValid = verifyOtpHash(otp.trim(), user.loginOtp);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid 6-digit login code.' });
    }

    user.loginOtp = undefined;
    user.loginOtpExpires = undefined;

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact administrator.' });
    }

    let shop = null;
    if (user.role === 'SHOP_OWNER') {
      shop = await Shop.findOne({ ownerId: user._id });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    res.json({
      success: true,
      message: 'Signed in successfully via Gmail OTP.',
      data: {
        user: user.toJSON(),
        shop,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

