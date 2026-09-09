import {defineConfig} from 'prisma/config';
import { env } from '../configs/env';

export default defineConfig({
  schema: "./schema.prisma",
  datasource: {
    url: env.DATABASE_URL,
  },
});