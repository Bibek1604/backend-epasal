import { Router } from 'express';
import flashSaleController from '../controllers/flashSale.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { requireAdmin } from '../middlewares/authMiddleware';
import {
  createFlashSaleSchema,
  updateFlashSaleSchema,
  getFlashSaleByIdSchema,
  deleteFlashSaleSchema,
  getFlashSalesQuerySchema,
} from '../validations/flashSale.validation';

const router = Router();

/**
 * @openapi
 * /flash-sales/:
 *   get:
 *     tags:
 *       - flash-sales
 *     summary: List flash sales
 *     responses:
 *       200:
 *         description: OK
 *   post:
 *     tags:
 *       - flash-sales
 *     summary: Create flash sale (admin)
 * /flash-sales/{id}:
 *   get:
 *     tags:
 *       - flash-sales
 *     summary: Get flash sale by id
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *   put:
 *     tags:
 *       - flash-sales
 *     summary: Update flash sale (admin)
 *   delete:
 *     tags:
 *       - flash-sales
 *     summary: Delete flash sale (admin)
 */

/**
 * Public routes
 */
router.get(
  '/',
  validateRequest(getFlashSalesQuerySchema),
  flashSaleController.getFlashSales
);

router.get(
  '/active',
  flashSaleController.getActiveFlashSales
);

router.get(
  '/product/:productId',
  flashSaleController.getFlashSaleByProductId
);

router.get(
  '/:id',
  validateRequest(getFlashSaleByIdSchema),
  flashSaleController.getFlashSaleById
);

router.get(
  '/:id/is-active',
  validateRequest(getFlashSaleByIdSchema),
  flashSaleController.isFlashSaleActive
);

/**
 * Admin routes
 */
router.post(
  '/',
  requireAdmin,
  validateRequest(createFlashSaleSchema),
  flashSaleController.createFlashSale
);

router.put(
  '/:id',
  requireAdmin,
  validateRequest(updateFlashSaleSchema),
  flashSaleController.updateFlashSale
);

router.delete(
  '/:id',
  requireAdmin,
  validateRequest(deleteFlashSaleSchema),
  flashSaleController.deleteFlashSale
);

router.post(
  '/:id/increment-stock',
  requireAdmin,
  validateRequest(getFlashSaleByIdSchema),
  flashSaleController.incrementStock
);

router.post(
  '/deactivate-expired',
  requireAdmin,
  flashSaleController.deactivateExpiredFlashSales
);

export default router;
