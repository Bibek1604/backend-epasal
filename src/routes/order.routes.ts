import { Router } from 'express';
import orderController from '../controllers/order.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { requireAdmin, optionalAuth } from '../middlewares/authMiddleware';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  getOrderByIdSchema,
  getOrdersQuerySchema,
} from '../validations/order.validation';

const router = Router();

/**
 * @openapi
 * /orders/:
 *   post:
 *     tags:
 *       - orders
 *     summary: Create an order (public/optional auth)
 *   get:
 *     tags:
 *       - orders
 *     summary: List orders (admin)
 * /orders/{id}:
 *   get:
 *     tags:
 *       - orders
 *     summary: Get order by id (admin)
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 * /orders/{id}/status:
 *   put:
 *     tags:
 *       - orders
 *     summary: Update order status (admin)
 */

/**
 * Public/User routes
 */
router.post(
  '/',
  optionalAuth,
  validateRequest(createOrderSchema),
  orderController.createOrder
);

/**
 * Admin routes
 */
router.get(
  '/',
  requireAdmin,
  validateRequest(getOrdersQuerySchema),
  orderController.getOrders
);

router.get(
  '/stats',
  requireAdmin,
  orderController.getOrderStatistics
);

router.get(
  '/status/:status',
  requireAdmin,
  validateRequest(getOrdersQuerySchema),
  orderController.getOrdersByStatus
);

router.get(
  '/user/:userId',
  requireAdmin,
  validateRequest(getOrdersQuerySchema),
  orderController.getOrdersByUser
);

router.get(
  '/:id',
  requireAdmin,
  validateRequest(getOrderByIdSchema),
  orderController.getOrderById
);

router.get(
  '/:id/status',
  requireAdmin,
  validateRequest(getOrderByIdSchema),
  orderController.getOrderStatus
);

router.put(
  '/:id/status',
  requireAdmin,
  validateRequest(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

export default router;
