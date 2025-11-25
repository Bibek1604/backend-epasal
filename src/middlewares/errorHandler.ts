import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

/**
 * Global error handling middleware
 * Must be placed after all routes
 */
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Check if it's an operational error
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }

  // Mongoose duplicate key error
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value entered';
  }

  // Mongoose cast error (invalid ObjectId)
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

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      statusCode,
    });
  }

  // Send response
  const response: any = {
    success: false,
    message,
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.error = {
      name: err.name,
      message: err.message,
      stack: err.stack,
    };
  }

  res.status(statusCode).json(response);
};

/**
 * Handle 404 - Not Found
 */
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const error = new AppError(`Route not found: ${req.originalUrl}`, 404);
  next(error);
};
