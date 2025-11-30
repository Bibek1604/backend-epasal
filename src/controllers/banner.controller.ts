import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import bannerService from '../services/banner.service';
import { sendSuccess, sendPaginatedResponse } from '../utils/responseHelper';
import { uploadLocalImage, deleteLocalImage } from '../middlewares/upload';

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
   */
  createBanner = asyncHandler(async (req: Request, res: Response) => {
    let imageUrl: string | undefined;

    // Handle image upload - using local storage
    if (req.file) {
      imageUrl = uploadLocalImage(req.file);
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

    // Handle image upload - using local storage
    if (req.file) {
      // Get old banner to delete old image
      const oldBanner = await bannerService.getBannerById(id);
      if (oldBanner.imageUrl) {
        deleteLocalImage(oldBanner.imageUrl);
      }

      imageUrl = uploadLocalImage(req.file);
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

    // Get banner to delete image
    const banner = await bannerService.getBannerById(id);
    if (banner.imageUrl) {
      deleteLocalImage(banner.imageUrl);
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
