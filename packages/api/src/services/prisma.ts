import {PrismaPg} from '@prisma/adapter-pg';
import pg from 'pg'
import {PrismaClient} from '../DB/generated/prisma/client.js';
import {env} from '../configs/env.js';

const connectionString = env.DATABASE_URL;

const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const pool = new pg.Pool({ 
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool); 

export const prisma = new PrismaClient({adapter});