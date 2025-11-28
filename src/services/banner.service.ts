import { Banner } from '../models/Banner';
import { ICreateBannerBody, IPaginationQuery } from '../types';
import { generateId } from '../utils/generateId';
import { NotFoundError } from '../utils/errors';

export class BannerService {
  /**
   * Get all banners with pagination and filters
   */
  async getBanners(query: IPaginationQuery) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      order = 'desc',
    } = query;

    const filter: any = {};

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [banners, total] = await Promise.all([
      Banner.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean()
        .select('-_id -__v'),
      Banner.countDocuments(filter),
    ]);

    return {
      banners,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get banner by ID
   */
  async getBannerById(id: string) {
    const banner = await Banner.findOne({ id }).lean().select('-_id -__v');

    if (!banner) {
      throw new NotFoundError('Banner not found');
    }

    return banner;
  }

  /**
   * Create new banner
   */
  async createBanner(data: ICreateBannerBody, imageUrl?: string) {
    const id = generateId('banner');
    const created_at = new Date().toISOString();

    const bannerData = {
      id,
      ...data,
      imageUrl: imageUrl || null,
      created_at,
    };

    const banner = await Banner.create(bannerData);
    return banner.toObject({ versionKey: false, transform: (_doc, ret) => {
      delete (ret as any)._id;
      return ret;
    }});
  }

  /**
   * Update banner
   */
  async updateBanner(id: string, data: Partial<ICreateBannerBody>, imageUrl?: string) {
    const banner = await Banner.findOne({ id });

    if (!banner) {
      throw new NotFoundError('Banner not found');
    }

    if (imageUrl) {
      (data as any).imageUrl = imageUrl;
    }

    Object.assign(banner, data);
    await banner.save();

    return banner.toObject({ versionKey: false, transform: (_doc, ret) => {
      delete (ret as any)._id;
      return ret;
    }});
  }

  /**
   * Delete banner
   */
  async deleteBanner(id: string) {
    const banner = await Banner.findOneAndDelete({ id });

    if (!banner) {
      throw new NotFoundError('Banner not found');
    }

    return { message: 'Banner deleted successfully' };
  }

  /**
   * Get active banners
   */
  async getActiveBanners() {
    const banners = await Banner.find({ isActive: true })
      .sort({ created_at: -1 })
      .lean()
      .select('-_id -__v');

    return banners;
  }
}

export default new BannerService();
