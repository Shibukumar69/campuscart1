import mongoose from 'mongoose';

const purchaseOrderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    title: String,
    sku: String,
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitCost: {
      type: Number,
      required: true,
      min: 0,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      default: 'AI Reorder Suggestion (Lead Time Demand + Safety Stock)',
    },
  },
  { _id: false }
);

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    supplierName: {
      type: String,
      required: true,
      default: 'Campus Wholesale Stationery Distributors Ltd.',
    },
    items: [purchaseOrderItemSchema],
    totalCost: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'ORDERED', 'RECEIVED', 'CANCELLED'],
      default: 'DRAFT',
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    createdFromRecommendation: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);
