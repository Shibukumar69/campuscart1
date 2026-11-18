import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Shop name is required'],
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    campusLocation: {
      type: String,
      required: true,
      default: 'Central Campus Student Center, Ground Floor',
    },
    supportedDeliveryAreas: {
      type: [String],
      default: ['Hostel Block A', 'Hostel Block B', 'Hostel Block C', 'Girls Hostel 1', 'Boys Hostel 2', 'Library Arcade'],
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    commissionRate: {
      type: Number,
      default: 0.05, // 5% platform commission
    },
    approvalStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'APPROVED',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    operatingHours: {
      type: String,
      default: '8:30 AM - 9:30 PM (Mon-Sat)',
    },
    offersPrinting: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Shop = mongoose.model('Shop', shopSchema);
