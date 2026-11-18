import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productTitleSnapshot: {
      type: String,
      required: true,
    },
    skuSnapshot: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    unitPriceSnapshot: {
      type: Number,
      required: true,
      min: 0,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
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
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      default: 15,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'SANDBOX'],
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    deliveryType: {
      type: String,
      enum: ['HOSTEL_DELIVERY', 'SELF_PICKUP'],
      default: 'HOSTEL_DELIVERY',
    },
    deliveryAddressSnapshot: {
      recipientName: String,
      phone: String,
      hostelBlock: String,
      roomNumber: String,
      campusLandmark: String,
    },
    deliveryAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    deliveryOtp: {
      type: String,
    },
    deliveryOtpHash: {
      type: String,
      select: false,
    },
    deliveryOtpAttempts: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        'PLACED',
        'ACCEPTED',
        'PREPARING',
        'READY_FOR_PICKUP',
        'OUT_FOR_DELIVERY',
        'COMPLETED',
        'CANCELLED',
        'REJECTED',
      ],
      default: 'PLACED',
      index: true,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    statusTimeline: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ shopId: 1, status: 1 });
orderSchema.index({ studentId: 1, createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);
