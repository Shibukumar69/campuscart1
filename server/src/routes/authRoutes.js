import { Router } from 'express';
import {
  register,
  login,
  refresh,
  getMe,
  logout,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  sendLoginOtp,
  loginWithOtp,
  sendSignupOtp,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/send-signup-otp', sendSignupOtp);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

// Gmail OTP & Password Reset routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);
router.post('/send-login-otp', sendLoginOtp);
router.post('/login-otp', loginWithOtp);

export default router;

