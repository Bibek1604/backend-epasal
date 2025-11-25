import mongoose, { Schema, Document } from 'mongoose';
import { IBanner } from '../types';

export interface IBannerDocument extends Omit<IBanner, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const BannerSchema = new Schema<IBannerDocument>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: null,
    },
    imageUrl: {
      type: String,
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

// Compound index
BannerSchema.index({ isActive: 1, created_at: -1 });

export const Banner = mongoose.model<IBannerDocument>('Banner', BannerSchema);
