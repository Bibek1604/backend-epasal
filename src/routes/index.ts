import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import categoryRoutes from './category.routes';
import bannerRoutes from './banner.routes';
import couponRoutes from './coupon.routes';
import flashSaleRoutes from './flashSale.routes';

const router = Router();

// Mount all routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/categories', categoryRoutes);
router.use('/banners', bannerRoutes);
router.use('/coupons', couponRoutes);
router.use('/flash-sales', flashSaleRoutes);

// Health check route
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - health
 *     summary: Health check
 *     responses:
 *       200:
 *         description: OK
 */

export default router;
