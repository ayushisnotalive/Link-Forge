import fastify from 'fastify';

import {
  validatorCompiler,
  type ZodTypeProvider,
  serializerCompiler
} from 'fastify-type-provider-zod';
import { env } from './configs/env.js';
import authRoutes from './routes/auth.router.js'
import linksRoutes from './routes/link.router.js';
import redirectRoutes from './routes/redirect.routes.js';

import cookie from '@fastify/cookie';

const app = fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(cookie);

app.register(authRoutes, { prefix: "/api/auth" });
app.register(linksRoutes,{prefix:"/api/links"})
app.register(redirectRoutes)

app.get('/health', async () => {
  return { status: 'ok' };
});

const startServer = async () => {
  try {
    await app.listen({ port: env.PORT });
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};

startServer();