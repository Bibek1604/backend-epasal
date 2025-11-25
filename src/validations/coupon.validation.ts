import Joi from 'joi';

// Coupon Validation
export const createCouponSchema = {
  body: Joi.object({
    code: Joi.string().required().trim().uppercase().min(3).max(50),
    discountAmount: Joi.number().required().min(0),
    validFrom: Joi.alternatives().try(Joi.string(), Joi.date()).required(),
    validTo: Joi.alternatives().try(Joi.string(), Joi.date()).required(),
    isActive: Joi.boolean().optional(),
  }),
};

export const updateCouponSchema = {
  body: Joi.object({
    code: Joi.string().trim().uppercase().min(3).max(50).optional(),
    discountAmount: Joi.number().min(0).optional(),
    validFrom: Joi.alternatives().try(Joi.string(), Joi.date()).optional(),
    validTo: Joi.alternatives().try(Joi.string(), Joi.date()).optional(),
    isActive: Joi.boolean().optional(),
  }),
  params: Joi.object({
    code: Joi.string().required(),
  }),
};

export const getCouponByCodeSchema = {
  params: Joi.object({
    code: Joi.string().required(),
  }),
};

export const deleteCouponSchema = {
  params: Joi.object({
    code: Joi.string().required(),
  }),
};

export const getCouponsQuerySchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    isActive: Joi.boolean().optional(),
    sortBy: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').optional(),
  }),
};

export const validateCouponSchema = {
  body: Joi.object({
    code: Joi.string().required().trim().uppercase(),
  }),
};
