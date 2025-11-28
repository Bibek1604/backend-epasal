import { Router } from 'express';
import Joi from 'joi';
import * as authController from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Admin Login
 *     description: Login with email and password to get JWT token for admin operations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@epasaley.com
 *               password:
 *                 type: string
 *                 example: ePasaley@SecureAdmin2025!
 *     responses:
 *       200:
 *         description: Login successful - Returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT token for authorization
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     admin:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: 507f1f77bcf86cd799439011
 *                         adminId:
 *                           type: string
 *                           example: ADMIN001
 *                         name:
 *                           type: string
 *                           example: Admin User
 *                         email:
 *                           type: string
 *                           example: admin@epasaley.com
 *                         role:
 *                           type: string
 *                           enum: [admin, super_admin]
 *                           example: super_admin
 *       400:
 *         description: Bad Request - Missing or invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Email is required
 *       401:
 *         description: Unauthorized - Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid email or password
 */
router.post('/login', validateRequest({
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email',
    }),
    password: Joi.string().required().min(6).messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters',
    }),
  }),
}), authController.login);

export default router;
