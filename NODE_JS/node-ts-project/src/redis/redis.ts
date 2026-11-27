import { Redis } from "@upstash/redis";
import { env } from "../config/env";

export const redisClient = new Redis({
    url: env.upstashRedisUrl,
    token: env.upstashRedisToken,
});
