import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

// ===========================================
// GLOBAL ERROR HANDLER
// ===========================================
// Catches all errors and returns consistent JSON response

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Default values
  let statusCode = 500;
  let message = 'Internal Server Error';

  // ===========================================
  // Handle known error types
  // ===========================================

  // Custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Multer errors (file upload)
  if (err.name === 'MulterError') {
    statusCode = 400;
    const multerErr = err as any;
    switch (multerErr.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large. Maximum size is 5MB.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected field. Use "image" for file upload.';
        break;
      default:
        message = `Upload error: ${multerErr.message}`;
    }
  }

  // Cloudinary errors
  if (err.message?.includes('Cloudinary')) {
    statusCode = 500;
    message = 'Image upload failed. Please try again.';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }

  // Mongoose duplicate key
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value entered';
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // ===========================================
  // Log error (always in production for debugging)
  // ===========================================
  console.error(`❌ [${statusCode}] ${err.name}: ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // ===========================================
  // Send response
  // ===========================================
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && {
      error: { name: err.name, stack: err.stack },
    }),
  });
};

// ===========================================
// 404 NOT FOUND HANDLER
// ===========================================
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const error = new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404);
  next(error);
};
