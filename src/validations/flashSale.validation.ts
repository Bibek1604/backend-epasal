import Joi from 'joi';

// Flash Sale Validation
export const createFlashSaleSchema = {
  body: Joi.object({
    productId: Joi.string().required(),
    flashPrice: Joi.number().required().min(0),
    maxStock: Joi.number().required().integer().min(0),
    startTime: Joi.string().required(),
    endTime: Joi.string().required(),
    isActive: Joi.boolean().optional(),
  }),
};

export const updateFlashSaleSchema = {
  body: Joi.object({
    productId: Joi.string().optional(),
    flashPrice: Joi.number().min(0).optional(),
    currentStock: Joi.number().integer().min(0).optional(),
    maxStock: Joi.number().integer().min(0).optional(),
    startTime: Joi.string().optional(),
    endTime: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
  }),
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

export const getFlashSaleByIdSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

export const deleteFlashSaleSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

export const getFlashSalesQuerySchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    productId: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
    sortBy: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').optional(),
  }),
};
