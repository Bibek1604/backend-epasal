import { Request, Response } from 'express';
import { Admin } from '../models/Admin';
import { generateToken } from '../utils/tokenGenerator';
import { BadRequestError, UnauthorizedError } from '../utils/errors';
import { asyncHandler } from '../middlewares/asyncHandler';

/**
 * LOGIN ENDPOINT - Get JWT token with Email + Password
 *
 * @route POST /api/v1/auth/login
 * @param {string} email - Admin email (e.g., "admin@epasaley.com")
 * @param {string} password - Admin password
 * @returns {Object} - { token, admin: { id, adminId, name, email, role } }
 */
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    throw new BadRequestError('Email and password are required');
  }

  // Find admin by email (with password field selected)
  const admin = await Admin.findOne({ email }).select('+password');

  if (!admin) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (!admin.isActive) {
    throw new UnauthorizedError('Admin account is inactive');
  }

  // Compare password
  const isPasswordValid = await admin.comparePassword(password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Update last login
  admin.lastLogin = new Date();
  await admin.save();

  // Generate token
  const token = generateToken(
    {
      id: admin._id.toString(),
      email: admin.email,
      role: 'admin', // Use admin role for token
    },
    '7d' // Token expires in 7 days
  );

  // Return response with token - ONLY LOGIN
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      admin: {
        id: admin._id,
        adminId: admin.adminId,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    },
  });
});
