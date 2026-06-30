import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createError } from '../middleware/error.js';
import { executeWorkflow } from '../services/executor.js';
import { logger } from '../lib/logger.js';

const router = Router();
router.use(authMiddleware);

const executeSchema = z.object({
  nodes: z.array(z.record(z.unknown())),
  edges: z.array(z.record(z.unknown())),
});

router.post('/', validateBody(executeSchema), async (req: AuthRequest, res, next) => {
  try {
    const { nodes, edges } = req.body;

    const execution = await prisma.execution.create({
      data: {
        workflowId: 'adhoc',
        userId: req.user!.id,
        status: 'RUNNING',
        logs: [],
      },
    });

    const result = await executeWorkflow(nodes as any[], edges as any[]);

    await prisma.execution.update({
      where: { id: execution.id },
      data: {
        status: result.success ? 'SUCCESS' : 'FAILED',
        logs: result.logs as any,
        finishedAt: new Date(),
      },
    });

    res.json({ success: result.success, logs: result.logs, executionId: execution.id });
  } catch (err) {
    logger.error({ err }, 'Execution failed');
    next(err);
  }
});

router.post('/:workflowId', async (req: AuthRequest, res, next) => {
  try {
    const workflow = await prisma.workflow.findFirst({
      where: { id: req.params.workflowId, userId: req.user!.id },
    });
    if (!workflow) {
      return next(createError('Workflow not found', 404, 'WORKFLOW_NOT_FOUND'));
    }

    const execution = await prisma.execution.create({
      data: {
        workflowId: workflow.id,
        userId: req.user!.id,
        status: 'RUNNING',
        logs: [],
      },
    });

    const nodes = workflow.nodes as any[];
    const edges = workflow.edges as any[];
    const result = await executeWorkflow(nodes, edges);

    await prisma.execution.update({
      where: { id: execution.id },
      data: {
        status: result.success ? 'SUCCESS' : 'FAILED',
        logs: result.logs as any,
        finishedAt: new Date(),
      },
    });

    res.json({ success: result.success, logs: result.logs, executionId: execution.id });
  } catch (err) {
    logger.error({ err }, 'Execution failed');
    next(err);
  }
});

export default router;