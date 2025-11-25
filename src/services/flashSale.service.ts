import { FlashSale } from '../models/FlashSale';
import { ICreateFlashSaleBody, IPaginationQuery } from '../types';
import { generateId } from '../utils/generateId';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors';

export class FlashSaleService {
  /**
   * Get all flash sales with pagination and filters
   */
  async getFlashSales(query: IPaginationQuery & { productId?: string }) {
    const {
      page = 1,
      limit = 20,
      productId,
      sortBy = 'created_at',
      order = 'desc',
    } = query;

    const filter: any = {};

    if (productId) {
      filter.productId = productId;
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [flashSales, total] = await Promise.all([
      FlashSale.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean()
        .select('-_id -__v'),
      FlashSale.countDocuments(filter),
    ]);

    return {
      flashSales,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get flash sale by ID
   */
  async getFlashSaleById(id: string) {
    const flashSale = await FlashSale.findOne({ id }).lean().select('-_id -__v');

    if (!flashSale) {
      throw new NotFoundError('Flash sale not found');
    }

    return flashSale;
  }

  /**
   * Get flash sale by product ID
   */
  async getFlashSaleByProductId(productId: string) {
    const flashSale = await FlashSale.findOne({ 
      productId, 
      isActive: true 
    }).lean().select('-_id -__v');

    return flashSale;
  }

  /**
   * Create new flash sale
   */
  async createFlashSale(data: ICreateFlashSaleBody) {
    const id = generateId('flash');
    const created_at = new Date().toISOString();

    // Validate time range
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (endTime <= startTime) {
      throw new BadRequestError('End time must be after start time');
    }

    // Check if product already has an active flash sale
    const existingFlashSale = await FlashSale.findOne({
      productId: data.productId,
      isActive: true,
      endTime: { $gte: created_at },
    });

    if (existingFlashSale) {
      throw new ConflictError('Product already has an active flash sale');
    }

    const flashSaleData = {
      id,
      ...data,
      currentStock: 0,
      created_at,
    };

    const flashSale = await FlashSale.create(flashSaleData);
    return flashSale.toObject({ versionKey: false, transform: (_doc, ret) => {
      delete (ret as any)._id;
      return ret;
    }});
  }

  /**
   * Update flash sale
   */
  async updateFlashSale(id: string, data: Partial<ICreateFlashSaleBody> & { currentStock?: number }) {
    const flashSale = await FlashSale.findOne({ id });

    if (!flashSale) {
      throw new NotFoundError('Flash sale not found');
    }

    // Validate time range if updating times
    if (data.startTime || data.endTime) {
      const startTime = new Date(data.startTime || flashSale.startTime);
      const endTime = new Date(data.endTime || flashSale.endTime);

      if (endTime <= startTime) {
        throw new BadRequestError('End time must be after start time');
      }
    }

    // Validate stock constraints
    if (data.currentStock !== undefined && data.maxStock) {
      if (data.currentStock > data.maxStock) {
        throw new BadRequestError('Current stock cannot exceed max stock');
      }
    } else if (data.currentStock !== undefined) {
      if (data.currentStock > flashSale.maxStock) {
        throw new BadRequestError('Current stock cannot exceed max stock');
      }
    } else if (data.maxStock !== undefined) {
      if (flashSale.currentStock > data.maxStock) {
        throw new BadRequestError('Max stock cannot be less than current stock');
      }
    }

    Object.assign(flashSale, data);
    await flashSale.save();

    return flashSale.toObject({ versionKey: false, transform: (_doc, ret) => {
      delete (ret as any)._id;
      return ret;
    }});
  }

  /**
   * Delete flash sale
   */
  async deleteFlashSale(id: string) {
    const flashSale = await FlashSale.findOneAndDelete({ id });

    if (!flashSale) {
      throw new NotFoundError('Flash sale not found');
    }

    return { message: 'Flash sale deleted successfully' };
  }

  /**
   * Get active flash sales
   */
  async getActiveFlashSales() {
    const now = new Date().toISOString();

    const flashSales = await FlashSale.find({
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now },
    })
      .sort({ created_at: -1 })
      .lean()
      .select('-_id -__v');

    return flashSales;
  }

  /**
   * Check if flash sale is currently active
   */
  async isFlashSaleActive(id: string): Promise<boolean> {
    const flashSale = await FlashSale.findOne({ id }).lean();

    if (!flashSale || !flashSale.isActive) {
      return false;
    }

    const now = new Date();
    const startTime = new Date(flashSale.startTime);
    const endTime = new Date(flashSale.endTime);

    return now >= startTime && now <= endTime;
  }

  /**
   * Increment stock (when item is sold)
   */
  async incrementStock(id: string, quantity: number = 1) {
    const flashSale = await FlashSale.findOne({ id });

    if (!flashSale) {
      throw new NotFoundError('Flash sale not found');
    }

    const newStock = flashSale.currentStock + quantity;

    if (newStock > flashSale.maxStock) {
      throw new BadRequestError('Flash sale stock limit reached');
    }

    flashSale.currentStock = newStock;
    await flashSale.save();

    return flashSale.toObject({ versionKey: false, transform: (_doc, ret) => {
      delete (ret as any)._id;
      return ret;
    }});
  }

  /**
   * Auto-deactivate expired flash sales
   */
  async deactivateExpiredFlashSales() {
    const now = new Date().toISOString();

    const result = await FlashSale.updateMany(
      {
        isActive: true,
        endTime: { $lt: now },
      },
      {
        $set: { isActive: false },
      }
    );

    return {
      message: `Deactivated ${result.modifiedCount} expired flash sales`,
      count: result.modifiedCount,
    };
  }
}

export default new FlashSaleService();
