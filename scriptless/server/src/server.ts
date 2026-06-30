import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { json } from 'express';
import { env } from './config.js';
import { logger } from './lib/logger.js';
import { errorHandler } from './middleware/error.js';
import { apiLimiter } from './middleware/rateLimit.js';

import authRoutes from './routes/auth.js';
import workflowRoutes from './routes/workflows.js';
import executeRoutes from './routes/execute.js';
import healthRoutes from './routes/health.js';
import aiRoutes from './routes/ai.js';

export function createServer() {
  const app = express();

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", "https://generativelanguage.googleapis.com", "https://api.twilio.com"],
      },
    },
  }));

  app.use(cors({
    origin: env.NODE_ENV === 'development' ? '*' : process.env.CLIENT_URL || undefined,
    credentials: true,
  }));

  app.use(json({ limit: '1mb' }));
  app.use(apiLimiter);

  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/workflows', workflowRoutes);
  app.use('/api/execute', executeRoutes);
  app.use('/api/generate', aiRoutes);

  app.use((_req, res) => {
    res.status(404).json({ success: false, error: { message: 'Not found', code: 'NOT_FOUND' } });
  });

  app.use(errorHandler);

  return app;
}

export function startServer() {
  const app = createServer();
  const server = app.listen(env.PORT, () => {
    logger.info(`ScriptLess server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });

  const gracefulShutdown = (signal: string) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  return server;
}