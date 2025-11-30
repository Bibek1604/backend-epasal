import { Router } from 'express';
import orderController from '../controllers/order.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { requireAdmin } from '../middlewares/authMiddleware';
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
 *     summary: Create an order (PUBLIC - no auth required)
 *   get:
 *     tags:
 *       - orders
 *     summary: List orders (admin only)
 * /orders/track/{id}:
 *   get:
 *     tags:
 *       - orders
 *     summary: Track order by ID (PUBLIC - no auth required)
 * /orders/{id}:
 *   get:
 *     tags:
 *       - orders
 *     summary: Get order details (admin only)
 * /orders/{id}/status:
 *   put:
 *     tags:
 *       - orders
 *     summary: Update order status (admin only)
 */

/**
 * ========================================
 * PUBLIC ROUTES (No authentication needed)
 * ========================================
 */

// Create order - PUBLIC (anyone can place an order)
router.post(
  '/',
  validateRequest(createOrderSchema),
  orderController.createOrder
);

// Track order by ID - PUBLIC (customers can track their orders)
router.get(
  '/track/:id',
  validateRequest(getOrderByIdSchema),
  orderController.trackOrder
);

/**
 * ========================================
 * ADMIN ROUTES (Authentication required)
 * ========================================
 */

// Get all orders - ADMIN ONLY
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
