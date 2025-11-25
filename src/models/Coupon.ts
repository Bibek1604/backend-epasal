import mongoose, { Schema, Document } from 'mongoose';
import { ICoupon } from '../types';

export interface ICouponDocument extends Omit<ICoupon, 'code'>, Document {
  _id: mongoose.Types.ObjectId;
  code: string;
}

const CouponSchema = new Schema<ICouponDocument>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    discountAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    validFrom: {
      type: Schema.Types.Mixed,
      required: true,
    },
    validTo: {
      type: Schema.Types.Mixed,
      required: true,
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

// Compound indexes
CouponSchema.index({ isActive: 1, validTo: 1 });
CouponSchema.index({ code: 1, isActive: 1 });

export const Coupon = mongoose.model<ICouponDocument>('Coupon', CouponSchema);
