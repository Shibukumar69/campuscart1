import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'campuscart_super_secret_jwt_access_key_2026_dev';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'campuscart_super_secret_jwt_refresh_key_2026_dev';

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    ACCESS_SECRET,
    { expiresIn: '1d' } // 1 day for convenient dev sessions, easily configurable
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
    },
    REFRESH_SECRET,
    { expiresIn: '30d' }
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};

/**
 * Generate a cryptographically secure 6-digit OTP and its SHA-256 hash
 */
export const generateDeliveryOtp = () => {
  const otp = Math.floor(100000 + crypto.randomInt(900000)).toString();
  const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
  return { otp, otpHash };
};

export const verifyOtpHash = (otp, hash) => {
  const calculated = crypto.createHash('sha256').update(otp).digest('hex');
  return calculated === hash;
};
