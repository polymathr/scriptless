import { Router } from 'express';
import { z } from 'zod';
import { generateWorkflow } from '../services/gemini.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { aiLimiter } from '../middleware/rateLimit.js';

const router = Router();
router.use(authMiddleware);
router.use(aiLimiter);

const generateSchema = z.object({
  history: z.array(z.object({ role: z.string(), content: z.string() })),
  currentWorkflow: z.object({
    nodes: z.array(z.record(z.unknown())),
    edges: z.array(z.record(z.unknown())),
  }).optional().nullable(),
});

router.post('/', validateBody(generateSchema), async (req: AuthRequest, res, next) => {
  try {
    const result = await generateWorkflow(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;