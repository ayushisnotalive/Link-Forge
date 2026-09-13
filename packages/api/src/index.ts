import fastify from 'fastify';
import { env } from './configs/env.js';
import authRoutes from './routes/auth.router.js';
import linksRoutes from './routes/link.router.js';
import redirectRoutes from './routes/redirect.routes.js';

import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { redis } from './services/redis.js';

const app = fastify({
  logger: true,
  trustProxy: true,
});

// --- Security & infra middleware ---

app.register(helmet, {
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

app.register(cors, {
  origin: "https://web-five-dusky-19.vercel.app",
  credentials: true,
});

app.register(cookie);

app.register(rateLimit, {
  global: false,
  redis: redis,
  errorResponseBuilder: (req, context) => ({
    error: 'Too many requests',
    retryAfter: context.after,
  }),
});

// --- Routes ---

app.register(authRoutes, { prefix: '/api/auth' });
app.register(linksRoutes, { prefix: '/api/links' });
app.register(redirectRoutes);

app.get('/health', async () => {
  return { status: 'ok' };
});

const startServer = async () => {
  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
  } catch (e) {
    app.log.error(e);
    process.exit(1);
  }
};

startServer();