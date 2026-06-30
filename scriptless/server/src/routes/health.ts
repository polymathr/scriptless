import { Router } from 'express';
import { prisma } from '../prisma.js';
import { logger } from '../lib/logger.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, ts: Date.now(), db: 'connected' });
  } catch (err) {
    logger.error({ err }, 'Health check failed');
    res.status(503).json({ ok: false, ts: Date.now(), db: 'disconnected' });
  }
});

export default router;