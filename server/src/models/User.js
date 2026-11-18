import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Don't return passwordHash by default
    },
    role: {
      type: String,
      enum: ['STUDENT', 'SHOP_OWNER', 'DELIVERY_AGENT', 'ADMIN'],
      default: 'STUDENT',
      index: true,
    },
    collegeId: {
      type: String,
      trim: true,
      default: '',
    },
    hostelBlock: {
      type: String,
      trim: true,
      default: '',
    },
    roomNumber: {
      type: String,
      trim: true,
      default: '',
    },
    addresses: [
      {
        label: { type: String, default: 'Hostel' },
        hostelBlock: String,
        roomNumber: String,
        campusLandmark: String,
        isDefault: { type: Boolean, default: true },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: true,
    },
    resetPasswordOtp: {
      type: String,
      select: false,
    },
    resetPasswordOtpExpires: {
      type: Date,
      select: false,
    },
    loginOtp: {
      type: String,
      select: false,
    },
    loginOtpExpires: {
      type: Date,
      select: false,
    },
    refreshTokens: [
      {
        token: { type: String },
        createdAt: { type: Date, default: Date.now, expires: '30d' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshTokens;
  return obj;
};

export const User = mongoose.model('User', userSchema);
