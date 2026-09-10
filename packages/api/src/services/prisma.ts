import {PrismaPg} from '@prisma/adapter-pg';
import pg from 'pg'
import {PrismaClient} from '../DB/generated/prisma/client.js';
import {env} from '../configs/env.js';

const connectionString = env.DATABASE_URL;

const pool = new pg.Pool({ connectionString });

const adapter = new PrismaPg(pool); 

export const prisma = new PrismaClient({adapter});