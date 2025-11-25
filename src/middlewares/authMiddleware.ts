import { Request, Response, NextFunction } from 'express';
import verifyToken from '../utils/tokenGenerator';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role?: 'admin' | 'user';
      };
    }
  }
}

/**
 * Middleware to verify JWT token
 */
export const authenticate = (isAdmin: boolean = false) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('No token provided');
      }

      const token = authHeader.split(' ')[1];

      if (!token) {
        throw new UnauthorizedError('Invalid token format');
      }

      // Verify token
      const decoded = verifyToken(token, isAdmin);

      // Check if admin role is required
      if (isAdmin && decoded.role !== 'admin') {
        throw new ForbiddenError('Admin access required');
      }

      // Attach user to request
      req.user = decoded;

      next();
    } catch (error) {
      if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
        next(error);
      } else {
        next(new UnauthorizedError('Invalid or expired token'));
      }
    }
  };
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = authenticate(true);

/**
 * Middleware to authenticate user (admin or regular user)
 */
export const requireAuth = authenticate(false);

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token, false);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
