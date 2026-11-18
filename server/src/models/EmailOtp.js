import mongoose from 'mongoose';

const emailOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['SIGNUP', 'RESET_PASSWORD', 'LOGIN'],
      default: 'SIGNUP',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0, // MongoDB TTL index auto-deletes expired OTP documents
    },
  },
  { timestamps: true }
);

export const EmailOtp = mongoose.model('EmailOtp', emailOtpSchema);
