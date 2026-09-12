import {Redis} from "ioredis";
import { env } from "../configs/env.js";

export const redis = new Redis(env.REDIS_URL, {
  connectTimeout: 10000,
  maxRetriesPerRequest: 3,
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});