import {PrismaPg} from '@prisma/adapter-pg';
import {PrismaClient} from '../DB/generated/prisma/client.js';
import {env} from '../configs/env.js';

const connectionString = env.DATABASE_URL;

const adapter = new PrismaPg({connectionString});
export const prisma = new PrismaClient({adapter});