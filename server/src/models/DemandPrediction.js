import mongoose from 'mongoose';

const demandPredictionSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    predictionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    targetDate: {
      type: Date,
      required: true,
    },
    horizonDays: {
      type: Number,
      required: true,
    },
    predictedUnits: {
      type: Number,
      required: true,
      min: 0,
    },
    lowerBound: {
      type: Number,
      default: 0,
    },
    upperBound: {
      type: Number,
      default: 0,
    },
    modelVersion: {
      type: String,
      default: '1.0.0',
    },
    confidenceMethod: {
      type: String,
      default: 'WALK_FORWARD_RESIDUALS',
    },
    trend: {
      type: String,
      enum: ['SURGE', 'STEADY', 'DECLINE'],
      default: 'STEADY',
    },
    spikeAlert: {
      type: Boolean,
      default: false,
    },
    dataSource: {
      type: String,
      enum: ['HISTORICAL_ORDERS', 'SYNTHETIC_DEMO'],
      default: 'HISTORICAL_ORDERS',
    },
  },
  {
    timestamps: true,
  }
);

demandPredictionSchema.index({ shopId: 1, productId: 1, targetDate: 1 });

export const DemandPrediction = mongoose.model('DemandPrediction', demandPredictionSchema);
