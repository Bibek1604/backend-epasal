import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import orderService from '../services/order.service';
import { sendSuccess, sendPaginatedResponse } from '../utils/responseHelper';

export class OrderController {
  /**
   * Get all orders
   * GET /api/v1/orders
   */
  getOrders = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as any;
    const result = await orderService.getOrders(query);

    sendPaginatedResponse(
      res,
      result.orders,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
      'Orders retrieved successfully'
    );
  });

  /**
   * Get order by ID
   * GET /api/v1/orders/:id
   */
  getOrderById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);

    sendSuccess(res, 200, 'Order retrieved successfully', order);
  });

  /**
   * Create new order
   * POST /api/v1/orders
   */
  createOrder = asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.createOrder(req.body);

    sendSuccess(res, 201, 'Order created successfully', order);
  });

  /**
   * Update order status
   * PUT /api/v1/orders/:id/status
   */
  updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const { status, note, location } = req.body;

    const order = await orderService.updateOrderStatus(id, status, { note, location });

    sendSuccess(res, 200, 'Order status updated successfully', order);
  });

  /**
   * Get order status history
   * GET /api/v1/orders/:id/status
   */
  getOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const history = await orderService.getOrderStatusHistory(id);
    sendSuccess(res, 200, 'Order status history retrieved successfully', history);
  });

  /**
   * Get orders by user
   * GET /api/v1/orders/user/:userId
   */
  getOrdersByUser = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const query = req.query as any;
    
    const result = await orderService.getOrdersByUser(userId, query);

    sendPaginatedResponse(
      res,
      result.orders,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
      'User orders retrieved successfully'
    );
  });

  /**
   * Get orders by status
   * GET /api/v1/orders/status/:status
   */
  getOrdersByStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.params;
    const query = req.query as any;
    
    const result = await orderService.getOrdersByStatus(status, query);

    sendPaginatedResponse(
      res,
      result.orders,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
      'Orders retrieved successfully'
    );
  });

  /**
   * Get order statistics
   * GET /api/v1/orders/stats
   */
  getOrderStatistics = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await orderService.getOrderStatistics();

    sendSuccess(res, 200, 'Order statistics retrieved successfully', stats);
  });

  /**
   * Track order by ID (PUBLIC - no auth required)
   * GET /api/v1/orders/track/:id
   * Returns limited order info for customer tracking
   */
  trackOrder = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);

    // Return only tracking-relevant information (not full order details)
    const trackingInfo = {
      orderId: order.id,
      status: order.status,
      statusHistory: order.statusHistory,
      customerName: order.name,
      totalAmount: order.totalAmount,
      createdAt: order.created_at,
    };

    sendSuccess(res, 200, 'Order tracking info retrieved successfully', trackingInfo);
  });
}

export default new OrderController();
