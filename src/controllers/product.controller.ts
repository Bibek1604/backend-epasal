import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import productService from '../services/product.service';
import { sendSuccess, sendPaginatedResponse } from '../utils/responseHelper';
import { uploadImage, deleteImage } from '../middlewares/upload';

export class ProductController {
  /**
   * Get all products
   * GET /api/v1/products
   */
  getProducts = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as any;
    const result = await productService.getProducts(query);

    sendPaginatedResponse(
      res,
      result.products,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
      'Products retrieved successfully'
    );
  });

  /**
   * Get product by ID
   * GET /api/v1/products/:id
   */
  getProductById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    sendSuccess(res, 200, 'Product retrieved successfully', product);
  });

  /**
   * Create new product
   * POST /api/v1/products
   */
  createProduct = asyncHandler(async (req: Request, res: Response) => {
    let imageUrl: string | undefined;

    // Upload image to Cloudinary
    if (req.file) {
      imageUrl = await uploadImage(req.file);
      console.log('✅ Product image uploaded to Cloudinary:', imageUrl);
    }

    const product = await productService.createProduct(req.body, imageUrl);

    sendSuccess(res, 201, 'Product created successfully', product);
  });

  /**
   * Update product
   * PUT /api/v1/products/:id
   */
  updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    let imageUrl: string | undefined;

    // Upload new image to Cloudinary if provided
    if (req.file) {
      // Delete old image from Cloudinary
      const oldProduct = await productService.getProductById(id);
      if (oldProduct.imageUrl) {
        await deleteImage(oldProduct.imageUrl);
      }

      imageUrl = await uploadImage(req.file);
      console.log('✅ Product image updated on Cloudinary:', imageUrl);
    }

    const product = await productService.updateProduct(id, req.body, imageUrl);

    sendSuccess(res, 200, 'Product updated successfully', product);
  });

  /**
   * Delete product
   * DELETE /api/v1/products/:id
   */
  deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Delete image from Cloudinary
    const product = await productService.getProductById(id);
    if (product.imageUrl) {
      await deleteImage(product.imageUrl);
    }

    const result = await productService.deleteProduct(id);

    sendSuccess(res, 200, result.message);
  });

  /**
   * Get products by category
   * GET /api/v1/products/category/:categoryId
   */
  getProductsByCategory = asyncHandler(async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const query = req.query as any;
    
    const result = await productService.getProductsByCategory(categoryId, query);

    sendPaginatedResponse(
      res,
      result.products,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
      'Products retrieved successfully'
    );
  });

  /**
   * Get products with offers
   * GET /api/v1/products/offers
   */
  getProductsWithOffers = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as any;
    const result = await productService.getProductsWithOffers(query);

    sendPaginatedResponse(
      res,
      result.products,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
      'Products with offers retrieved successfully'
    );
  });
}

export default new ProductController();
