import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { createError } from './error.js';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
      return next(createError(`Validation error: ${issues}`, 400, 'VALIDATION_ERROR'));
    }
    req.body = result.data;
    next();
  };
}