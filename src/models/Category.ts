import mongoose, { Schema, Document } from 'mongoose';
import { ICategory } from '../types';

export interface ICategoryDocument extends Omit<ICategory, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
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
CategorySchema.index({ isActive: 1, created_at: -1 });

export const Category = mongoose.model<ICategoryDocument>('Category', CategorySchema);
