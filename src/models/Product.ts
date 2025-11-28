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
      default: null,
    },
    beforePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    afterPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      required: true,
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
      default: null,
    },
    category_id: {
      type: String,
      default: null,
      index: true,
    },
    sectionId: {
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

// Compound indexes for efficient queries
ProductSchema.index({ isActive: 1, created_at: -1 });
ProductSchema.index({ category_id: 1, isActive: 1 });
ProductSchema.index({ sectionId: 1, isActive: 1 });
ProductSchema.index({ hasOffer: 1, isActive: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

export const Product = mongoose.model<IProductDocument>('Product', ProductSchema);
