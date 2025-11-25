import { Order } from '../models/Order';
import { ICreateOrderBody, IOrderQuery } from '../types';
import { generateId } from '../utils/generateId';
import { NotFoundError, BadRequestError } from '../utils/errors';

export class OrderService {
  /**
   * Get all orders with pagination and filters
   */
  async getOrders(query: IOrderQuery) {
    const {
      page = 1,
      limit = 20,
      status,
      userId,
      startDate,
      endDate,
      sortBy = 'created_at',
      order = 'desc',
    } = query;

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (userId) {
      filter.user_id = userId;
    }

    if (startDate || endDate) {
      filter.created_at = {};
      if (startDate) filter.created_at.$gte = startDate;
      if (endDate) filter.created_at.$lte = endDate;
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean()
        .select('-_id -__v'),
      Order.countDocuments(filter),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string) {
    const order = await Order.findOne({ id }).lean().select('-_id -__v');

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return order;
  }

  /**
   * Create new order
   */
  async createOrder(data: ICreateOrderBody) {
    const id = generateId('order');
    const created_at = new Date().toISOString();

    // Validate items
    if (!data.items || data.items.length === 0) {
      throw new BadRequestError('Order must have at least one item');
    }

    const orderData = {
      id,
      ...data,
      totalAmount: data.totalAmount,
      status: 'pending',
      statusHistory: [ { status: 'pending', timestamp: created_at } ],
      created_at,
    };

    const order = await Order.create(orderData);
    return order.toObject({ versionKey: false, transform: (_doc, ret) => {
      delete (ret as any)._id;
      return ret;
    }});
  }

  /**
   * Update order status
   */
  async updateOrderStatus(id: string, status: string, meta?: { note?: string; location?: string }) {
    const validStatuses = ['pending', 'confirmed', 'processing', 'sent', 'on_the_way', 'out_for_delivery', 'shipped', 'delivered', 'received', 'reached', 'cancelled'];

    if (!validStatuses.includes(status)) {
      throw new BadRequestError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const order = await Order.findOne({ id });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Append to status history with timestamp
    const timestamp = new Date().toISOString();
    const entry: any = { status, timestamp };
    if (meta?.note) entry.note = meta.note;
    if (meta?.location) entry.location = meta.location;
    // If caller passed additional info, allow note/location via arguments (handled by controller)
    // but service keeps signature simple; controller can call a helper below if needed
    if (!(order as any).statusHistory) (order as any).statusHistory = [];
    (order as any).statusHistory.push(entry);

    order.status = status as any;
    await order.save();

    return order.toObject({ versionKey: false, transform: (_doc, ret) => {
      delete (ret as any)._id;
      return ret;
    }});
  }

  /**
   * Get status history for an order
   */
  async getOrderStatusHistory(id: string) {
    const order = await Order.findOne({ id }).lean().select('id status statusHistory -_id');
    if (!order) throw new NotFoundError('Order not found');
    return { id: order.id, status: order.status, statusHistory: (order as any).statusHistory || [] };
  }

  /**
   * Get orders by user
   */
  async getOrdersByUser(userId: string, query: IOrderQuery) {
    return this.getOrders({ ...query, userId });
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(status: string, query: IOrderQuery) {
    return this.getOrders({ ...query, status });
  }

  /**
   * Get order statistics
   */
  async getOrderStatistics() {
    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'confirmed' }),
      Order.countDocuments({ status: 'processing' }),
      Order.countDocuments({ status: 'shipped' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    return {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
    };
  }
}

export default new OrderService();
