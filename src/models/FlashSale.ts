import mongoose, { Schema, Document } from 'mongoose';
import { IFlashSale } from '../types';

export interface IFlashSaleDocument extends Omit<IFlashSale, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const FlashSaleSchema = new Schema<IFlashSaleDocument>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    productId: {
      type: String,
      required: true,
      index: true,
    },
    flashPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    maxStock: {
      type: Number,
      required: true,
      min: 0,
    },
    startTime: {
      type: String,
      required: true,
      index: true,
    },
    endTime: {
      type: String,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    created_at: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Validation: currentStock should not exceed maxStock
FlashSaleSchema.pre('save', function (next) {
  if (this.currentStock > this.maxStock) {
    next(new Error('Current stock cannot exceed max stock'));
  } else {
    next();
  }
});

// Compound indexes for efficient queries
FlashSaleSchema.index({ isActive: 1, startTime: 1, endTime: 1 });
FlashSaleSchema.index({ productId: 1, isActive: 1 });

export const FlashSale = mongoose.model<IFlashSaleDocument>('FlashSale', FlashSaleSchema);
