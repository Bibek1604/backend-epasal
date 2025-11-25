import Joi from 'joi';

// Order Item Validation
const orderItemSchema = Joi.object({
  productId: Joi.string().required(),
  name: Joi.string().required(),
  price: Joi.number().required().min(0),
  quantity: Joi.number().required().integer().min(1),
  imageUrl: Joi.string().required(),
});

// Create Order Validation
export const createOrderSchema = {
  body: Joi.object({
    user_id: Joi.string().allow(null, '').optional(),
    first_name: Joi.string().allow(null, '').optional(),
    last_name: Joi.string().allow(null, '').optional(),
    name: Joi.string().required().trim(),
    phone: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    district: Joi.string().required().trim(),
    city: Joi.string().required().trim(),
    address: Joi.string().required().trim(),
    description: Joi.string().required().trim(),
    items: Joi.array().items(orderItemSchema).min(1).required(),
    totalAmount: Joi.number().required().min(0),
  }),
};

// Update Order Status Validation
export const updateOrderStatusSchema = {
  body: Joi.object({
    status: Joi.string()
      .valid('pending', 'confirmed', 'processing', 'sent', 'on_the_way', 'out_for_delivery', 'shipped', 'delivered', 'received', 'reached', 'cancelled')
      .required(),
    note: Joi.string().allow(null, '').optional(),
    location: Joi.string().allow(null, '').optional(),
  }),
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

export const getOrderByIdSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

export const getOrdersQuerySchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    status: Joi.string().optional(),
    userId: Joi.string().optional(),
    startDate: Joi.string().optional(),
    endDate: Joi.string().optional(),
    sortBy: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').optional(),
  }),
};
