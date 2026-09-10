import fastify from 'fastify';
import {
  validatorCompiler,
  type ZodTypeProvider,
  serializerCompiler
} from 'fastify-type-provider-zod';
import { env } from './configs/env.js';

const app = fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);


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