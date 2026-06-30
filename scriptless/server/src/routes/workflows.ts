import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createError } from '../middleware/error.js';

const router = Router();
router.use(authMiddleware);

const workflowSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  nodes: z.array(z.record(z.unknown())),
  edges: z.array(z.record(z.unknown())),
  isActive: z.boolean().default(true),
});

const updateSchema = workflowSchema.partial();

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const workflows = await prisma.workflow.findMany({
      where: { userId: req.user!.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { executions: true } },
      },
    });
    res.json({ success: true, workflows });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const workflow = await prisma.workflow.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: {
        executions: { orderBy: { startedAt: 'desc' }, take: 10 },
        schedules: true,
      },
    });
    if (!workflow) {
      return next(createError('Workflow not found', 404, 'WORKFLOW_NOT_FOUND'));
    }
    res.json({ success: true, workflow });
  } catch (err) {
    next(err);
  }
});

router.post('/', validateBody(workflowSchema), async (req: AuthRequest, res, next) => {
  try {
    const workflow = await prisma.workflow.create({
      data: {
        ...req.body,
        userId: req.user!.id,
      },
    });
    res.status(201).json({ success: true, workflow });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', validateBody(updateSchema), async (req: AuthRequest, res, next) => {
  try {
    const existing = await prisma.workflow.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!existing) {
      return next(createError('Workflow not found', 404, 'WORKFLOW_NOT_FOUND'));
    }

    const workflow = await prisma.workflow.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, workflow });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const existing = await prisma.workflow.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!existing) {
      return next(createError('Workflow not found', 404, 'WORKFLOW_NOT_FOUND'));
    }

    await prisma.workflow.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Workflow deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;