import mongoose from 'mongoose';

const inventoryLedgerSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    transactionType: {
      type: String,
      enum: ['RESTOCK', 'ORDER_DEDUCTION', 'RETURN', 'ADJUSTMENT'],
      required: true,
      index: true,
    },
    quantityChanged: {
      type: Number,
      required: true, // positive for restock/return, negative for deduction
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    referenceType: {
      type: String,
      enum: ['ORDER', 'PURCHASE_ORDER', 'MANUAL_COUNT', 'INITIAL_STOCK'],
      default: 'MANUAL_COUNT',
    },
    referenceId: {
      type: String,
      default: '',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

inventoryLedgerSchema.index({ shopId: 1, createdAt: -1 });
inventoryLedgerSchema.index({ productId: 1, createdAt: -1 });

export const InventoryLedger = mongoose.model('InventoryLedger', inventoryLedgerSchema);
