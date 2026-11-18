import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    SKU: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    costPrice: {
      type: Number,
      required: true,
      min: [0, 'Cost price must be positive'],
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    minStockThreshold: {
      type: Number,
      default: 15, // Reorder trigger threshold
      min: 1,
    },
    leadTimeDays: {
      type: Number,
      default: 2, // Supplier replenishment lead time in days
      min: 1,
    },
    safetyStock: {
      type: Number,
      default: 10, // Buffer stock required
      min: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    unit: {
      type: String,
      default: 'piece', // e.g. piece, pack, book
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for quick lookups & uniqueness per shop
productSchema.index({ shopId: 1, SKU: 1 }, { unique: true });
productSchema.index({ shopId: 1, categoryId: 1 });
productSchema.index({ title: 'text', description: 'text' });

export const Product = mongoose.model('Product', productSchema);
