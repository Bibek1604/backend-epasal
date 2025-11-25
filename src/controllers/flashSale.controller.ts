import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import flashSaleService from '../services/flashSale.service';
import { sendSuccess, sendPaginatedResponse } from '../utils/responseHelper';

export class FlashSaleController {
  /**
   * Get all flash sales
   * GET /api/v1/flash-sales
   */
  getFlashSales = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as any;
    const result = await flashSaleService.getFlashSales(query);

    sendPaginatedResponse(
      res,
      result.flashSales,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
      'Flash sales retrieved successfully'
    );
  });

  /**
   * Get flash sale by ID
   * GET /api/v1/flash-sales/:id
   */
  getFlashSaleById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const flashSale = await flashSaleService.getFlashSaleById(id);

    sendSuccess(res, 200, 'Flash sale retrieved successfully', flashSale);
  });

  /**
   * Get flash sale by product ID
   * GET /api/v1/flash-sales/product/:productId
   */
  getFlashSaleByProductId = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const flashSale = await flashSaleService.getFlashSaleByProductId(productId);

    if (!flashSale) {
      sendSuccess(res, 200, 'No active flash sale for this product', null);
    } else {
      sendSuccess(res, 200, 'Flash sale retrieved successfully', flashSale);
    }
  });

  /**
   * Create new flash sale
   * POST /api/v1/flash-sales
   */
  createFlashSale = asyncHandler(async (req: Request, res: Response) => {
    const flashSale = await flashSaleService.createFlashSale(req.body);

    sendSuccess(res, 201, 'Flash sale created successfully', flashSale);
  });

  /**
   * Update flash sale
   * PUT /api/v1/flash-sales/:id
   */
  updateFlashSale = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const flashSale = await flashSaleService.updateFlashSale(id, req.body);

    sendSuccess(res, 200, 'Flash sale updated successfully', flashSale);
  });

  /**
   * Delete flash sale
   * DELETE /api/v1/flash-sales/:id
   */
  deleteFlashSale = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await flashSaleService.deleteFlashSale(id);

    sendSuccess(res, 200, result.message);
  });

  /**
   * Get active flash sales
   * GET /api/v1/flash-sales/active
   */
  getActiveFlashSales = asyncHandler(async (_req: Request, res: Response) => {
    const flashSales = await flashSaleService.getActiveFlashSales();

    sendSuccess(res, 200, 'Active flash sales retrieved successfully', flashSales);
  });

  /**
   * Check if flash sale is active
   * GET /api/v1/flash-sales/:id/is-active
   */
  isFlashSaleActive = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const isActive = await flashSaleService.isFlashSaleActive(id);

    sendSuccess(res, 200, 'Flash sale status retrieved successfully', { isActive });
  });

  /**
   * Increment flash sale stock
   * POST /api/v1/flash-sales/:id/increment-stock
   */
  incrementStock = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { quantity } = req.body;

    const flashSale = await flashSaleService.incrementStock(id, quantity || 1);

    sendSuccess(res, 200, 'Flash sale stock incremented successfully', flashSale);
  });

  /**
   * Deactivate expired flash sales
   * POST /api/v1/flash-sales/deactivate-expired
   */
  deactivateExpiredFlashSales = asyncHandler(async (_req: Request, res: Response) => {
    const result = await flashSaleService.deactivateExpiredFlashSales();

    sendSuccess(res, 200, result.message, { count: result.count });
  });
}

export default new FlashSaleController();
