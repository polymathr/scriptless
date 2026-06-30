import { Response } from 'express';
import { logger } from '../lib/logger.js';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export function createError(message: string, statusCode: number = 500, code?: string): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

export function errorHandler(err: ApiError, _req: unknown, res: Response, _next: unknown) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error({ err: err.message, stack: err.stack, statusCode }, 'Request error');

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: err.code || 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}