import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import categoryService from '../services/category.service';
import { sendSuccess, sendPaginatedResponse } from '../utils/responseHelper';
import { uploadLocalImage, deleteLocalImage } from '../middlewares/upload';

export class CategoryController {
  /**
   * Get all categories
   * GET /api/v1/categories
   */
  getCategories = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as any;
    const result = await categoryService.getCategories(query);

    sendPaginatedResponse(
      res,
      result.categories,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
      'Categories retrieved successfully'
    );
  });

  /**
   * Get category by ID
   * GET /api/v1/categories/:id
   */
  getCategoryById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(id);

    sendSuccess(res, 200, 'Category retrieved successfully', category);
  });

  /**
   * Get category by slug
   * GET /api/v1/categories/slug/:slug
   */
  getCategoryBySlug = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const category = await categoryService.getCategoryBySlug(slug);

    sendSuccess(res, 200, 'Category retrieved successfully', category);
  });

  /**
   * Create new category
   * POST /api/v1/categories
   */
  createCategory = asyncHandler(async (req: Request, res: Response) => {
    let imageUrl: string | undefined;

    // Handle image upload - uses Cloudinary in production, local in dev
    if (req.file) {
      imageUrl = await uploadLocalImage(req.file);
    }

    const category = await categoryService.createCategory(req.body, imageUrl);

    sendSuccess(res, 201, 'Category created successfully', category);
  });

  /**
   * Update category
   * PUT /api/v1/categories/:id
   */
  updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    let imageUrl: string | undefined;

    // Handle image upload - uses Cloudinary in production, local in dev
    if (req.file) {
      // Get old category to delete old image
      const oldCategory = await categoryService.getCategoryById(id);
      if (oldCategory.imageUrl) {
        await deleteLocalImage(oldCategory.imageUrl);
      }

      imageUrl = await uploadLocalImage(req.file);
    }

    const category = await categoryService.updateCategory(id, req.body, imageUrl);

    sendSuccess(res, 200, 'Category updated successfully', category);
  });

  /**
   * Delete category
   * DELETE /api/v1/categories/:id
   */
  deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Get category to delete image
    const category = await categoryService.getCategoryById(id);
    if (category.imageUrl) {
      await deleteLocalImage(category.imageUrl);
    }

    const result = await categoryService.deleteCategory(id);

    sendSuccess(res, 200, result.message);
  });

  /**
   * Get active categories
   * GET /api/v1/categories/active
   */
  getActiveCategories = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await categoryService.getActiveCategories();

    sendSuccess(res, 200, 'Active categories retrieved successfully', categories);
  });
}

export default new CategoryController();
