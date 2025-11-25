import { Coupon } from '../models/Coupon';
import { ICreateCouponBody, IPaginationQuery } from '../types';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';

export class CouponService {
  /**
   * Get all coupons with pagination and filters
   */
  async getCoupons(query: IPaginationQuery) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      order = 'desc',
    } = query;

    const filter: any = {};

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [coupons, total] = await Promise.all([
      Coupon.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean()
        .select('-_id -__v'),
      Coupon.countDocuments(filter),
    ]);

    return {
      coupons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get coupon by code
   */
  async getCouponByCode(code: string) {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() }).lean().select('-_id -__v');

    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }

    return coupon;
  }

  /**
   * Create new coupon
   */
  async createCoupon(data: ICreateCouponBody) {
    const created_at = new Date().toISOString();

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: data.code.toUpperCase() });
    if (existingCoupon) {
      throw new ConflictError('Coupon code already exists');
    }

    // Validate dates
    const validFrom = new Date(data.validFrom);
    const validTo = new Date(data.validTo);

    if (validTo <= validFrom) {
      throw new BadRequestError('Valid to date must be after valid from date');
    }

    const couponData = {
      ...data,
      code: data.code.toUpperCase(),
      created_at,
    };

    const coupon = await Coupon.create(couponData);
    return coupon.toObject({ versionKey: false, transform: (_doc, ret) => {
      delete (ret as any)._id;
      return ret;
    }});
  }

  /**
   * Update coupon
   */
  async updateCoupon(code: string, data: Partial<ICreateCouponBody>) {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }

    // If updating code, check for duplicates
    if (data.code && data.code.toUpperCase() !== code.toUpperCase()) {
      const existingCoupon = await Coupon.findOne({ code: data.code.toUpperCase() });
      if (existingCoupon) {
        throw new ConflictError('Coupon code already exists');
      }
      data.code = data.code.toUpperCase();
    }

    // Validate dates if provided
    if (data.validFrom || data.validTo) {
      const validFrom = new Date(data.validFrom || coupon.validFrom);
      const validTo = new Date(data.validTo || coupon.validTo);

      if (validTo <= validFrom) {
        throw new BadRequestError('Valid to date must be after valid from date');
      }
    }

    Object.assign(coupon, data);
    await coupon.save();

    return coupon.toObject({ versionKey: false, transform: (_doc, ret) => {
      delete (ret as any)._id;
      return ret;
    }});
  }

  /**
   * Delete coupon
   */
  async deleteCoupon(code: string) {
    const coupon = await Coupon.findOneAndDelete({ code: code.toUpperCase() });

    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }

    return { message: 'Coupon deleted successfully' };
  }

  /**
   * Validate coupon
   */
  async validateCoupon(code: string) {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() }).lean();

    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }

    if (!coupon.isActive) {
      throw new BadRequestError('Coupon is not active');
    }

    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validTo = new Date(coupon.validTo);

    if (now < validFrom) {
      throw new BadRequestError('Coupon is not yet valid');
    }

    if (now > validTo) {
      throw new BadRequestError('Coupon has expired');
    }

    return {
      valid: true,
      discountAmount: coupon.discountAmount,
      code: coupon.code,
    };
  }

  /**
   * Get active coupons
   */
  async getActiveCoupons() {
    const now = new Date().toISOString();

    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validTo: { $gte: now },
    })
      .sort({ created_at: -1 })
      .lean()
      .select('-_id -__v');

    return coupons;
  }
}

export default new CouponService();
