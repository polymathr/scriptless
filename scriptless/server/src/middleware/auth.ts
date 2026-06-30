import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config.js';
import { prisma } from '../prisma.js';
import { createError } from './error.js';

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export async function authMiddleware(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createError('Unauthorized', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return next(createError('Unauthorized', 401, 'UNAUTHORIZED'));
    }
    req.user = { id: user.id, email: user.email };
    next();
  } catch {
    return next(createError('Unauthorized', 401, 'UNAUTHORIZED'));
  }
}