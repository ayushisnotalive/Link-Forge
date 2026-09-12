import fastify from 'fastify';

import {
  validatorCompiler,
  type ZodTypeProvider,
  serializerCompiler
} from 'fastify-type-provider-zod';
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
  trustProxy: true, // required so req.ip resolves correctly behind a platform's proxy/load balancer
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// --- Security & infra middleware ---

app.register(helmet, {
  // Fastify's helmet defaults are sane; only override if you serve HTML/embed content
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // needed if frontend is on a different origin
});

app.register(cors, {
  origin: env.FRONTEND_URL, // e.g. "https://yourapp.vercel.app" — never use "*" when credentials: true
  credentials: true, // required for cookies to be sent cross-origin
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
});

app.register(cookie);

app.register(rateLimit, {
  global: false, // set per-route limits instead of one blanket rule
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
    await app.listen({ port: env.PORT, host: '0.0.0.0' }); // host 0.0.0.0 needed for most deploy platforms
  } catch (e) {
    app.log.error(e);
    process.exit(1);
  }
};

startServer();