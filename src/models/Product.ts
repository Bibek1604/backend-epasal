import mongoose, { Schema, Document } from 'mongoose';
import { IProduct } from '../types';

export interface IProductDocument extends Omit<IProduct, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const ProductSchema = new Schema<IProductDocument>(
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
    description: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    hasOffer: {
      type: Boolean,
      default: false,
      index: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    stock: {
      type: Number,
      default: 0,
    },
    category_id: {
      type: String,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);// Compound indexes for efficient queries
ProductSchema.index({ isActive: 1, createdAt: -1 });
ProductSchema.index({ category_id: 1, isActive: 1 });
ProductSchema.index({ hasOffer: 1, isActive: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

export const Product = mongoose.model<IProductDocument>('Product', ProductSchema);
