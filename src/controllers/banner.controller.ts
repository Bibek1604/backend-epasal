import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import bannerService from '../services/banner.service';
import { sendSuccess, sendPaginatedResponse } from '../utils/responseHelper';
import { uploadImage, deleteImage } from '../middlewares/upload';

export class BannerController {
  /**
   * Get all banners
   * GET /api/v1/banners
   */
  getBanners = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as any;
    const result = await bannerService.getBanners(query);

    sendPaginatedResponse(
      res,
      result.banners,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
      'Banners retrieved successfully'
    );
  });

  /**
   * Get banner by ID
   * GET /api/v1/banners/:id
   */
  getBannerById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const banner = await bannerService.getBannerById(id);

    sendSuccess(res, 200, 'Banner retrieved successfully', banner);
  });

  /**
   * Create new banner
   * POST /api/v1/banners
   * Image is uploaded to Cloudinary, secure_url is stored in MongoDB
   */
  createBanner = asyncHandler(async (req: Request, res: Response) => {
    let imageUrl: string | undefined;

    // Upload image to Cloudinary (memory storage → Cloudinary stream)
    if (req.file) {
      imageUrl = await uploadImage(req.file);
      console.log('✅ Banner image uploaded to Cloudinary:', imageUrl);
    }

    const banner = await bannerService.createBanner(req.body, imageUrl);

    sendSuccess(res, 201, 'Banner created successfully', banner);
  });

  /**
   * Update banner
   * PUT /api/v1/banners/:id
   */
  updateBanner = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    let imageUrl: string | undefined;

    // Upload new image to Cloudinary if provided
    if (req.file) {
      // Delete old image from Cloudinary
      const oldBanner = await bannerService.getBannerById(id);
      if (oldBanner.imageUrl) {
        await deleteImage(oldBanner.imageUrl);
      }

      // Upload new image
      imageUrl = await uploadImage(req.file);
      console.log('✅ Banner image updated on Cloudinary:', imageUrl);
    }

    const banner = await bannerService.updateBanner(id, req.body, imageUrl);

    sendSuccess(res, 200, 'Banner updated successfully', banner);
  });

  /**
   * Delete banner
   * DELETE /api/v1/banners/:id
   */
  deleteBanner = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Delete image from Cloudinary
    const banner = await bannerService.getBannerById(id);
    if (banner.imageUrl) {
      await deleteImage(banner.imageUrl);
    }

    const result = await bannerService.deleteBanner(id);

    sendSuccess(res, 200, result.message);
  });

  /**
   * Get active banners
   * GET /api/v1/banners/active
   */
  getActiveBanners = asyncHandler(async (_req: Request, res: Response) => {
    const banners = await bannerService.getActiveBanners();

    sendSuccess(res, 200, 'Active banners retrieved successfully', banners);
  });
}

export default new BannerController();
