// scratch.ts — delete after running once
import {redis} from '../src/services/redis.js'

await redis.set("test-key", "hello");
const value = await redis.get("test-key");
console.log("Redis says:", value);
process.exit(0);