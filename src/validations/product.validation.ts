import Joi from 'joi';

// Product Validation
export const createProductSchema = {
  body: Joi.object({
    name: Joi.string().required().trim().min(3).max(200),
    description: Joi.string().allow(null, '').optional(),
    price: Joi.number().min(0).allow(null).optional(),
    beforePrice: Joi.number().required().min(0),
    afterPrice: Joi.number().required().min(0),
    discountPrice: Joi.number().required().min(0),
    hasOffer: Joi.boolean().required(),
    stock: Joi.number().min(0).allow(null).optional(),
    category_id: Joi.string().allow(null, '').optional(),
    sectionId: Joi.string().required(),
    imageUrl: Joi.string().uri().optional(),
    isActive: Joi.boolean().optional(),
  }),
};

export const updateProductSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(3).max(200).optional(),
    description: Joi.string().allow(null, '').optional(),
    price: Joi.number().min(0).allow(null).optional(),
    beforePrice: Joi.number().min(0).optional(),
    afterPrice: Joi.number().min(0).optional(),
    discountPrice: Joi.number().min(0).optional(),
    hasOffer: Joi.boolean().optional(),
    stock: Joi.number().min(0).allow(null).optional(),
    category_id: Joi.string().allow(null, '').optional(),
    sectionId: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
  }),
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

export const getProductByIdSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

export const deleteProductSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

export const getProductsQuerySchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    search: Joi.string().optional(),
    categoryId: Joi.string().optional(),
    sectionId: Joi.string().optional(),
    hasOffer: Joi.boolean().optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
    isActive: Joi.boolean().optional(),
    sortBy: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').optional(),
  }),
};
