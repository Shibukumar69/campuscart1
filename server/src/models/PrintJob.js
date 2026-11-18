import mongoose from 'mongoose';

const printJobSchema = new mongoose.Schema(
  {
    jobCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    storedFileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    pageCount: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    copies: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    printColor: {
      type: String,
      enum: ['BW', 'COLOR'],
      default: 'BW',
    },
    paperSize: {
      type: String,
      enum: ['A4', 'A3'],
      default: 'A4',
    },
    sides: {
      type: String,
      enum: ['SINGLE', 'DOUBLE'],
      default: 'DOUBLE',
    },
    bindingType: {
      type: String,
      enum: ['NONE', 'STAPLE', 'SPIRAL', 'HARDBOUND'],
      default: 'NONE',
    },
    additionalNotes: {
      type: String,
      default: '',
    },
    estimatedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    finalPrice: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['SUBMITTED', 'ACCEPTED', 'PRINTING', 'READY_FOR_PICKUP', 'DELIVERED', 'REJECTED'],
      default: 'SUBMITTED',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

printJobSchema.index({ shopId: 1, status: 1 });
printJobSchema.index({ studentId: 1, createdAt: -1 });

export const PrintJob = mongoose.model('PrintJob', printJobSchema);
