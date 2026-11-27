import { createClient } from "redis";
import { env } from "../config/env";

const redisUrl = env.redisUrl ||  process.env.REDIS_URL || "redis://localhost:6380";

export const redisClient = createClient({ url: redisUrl });


redisClient.on("connect", () => {
  console.log(`Redis client connected`);
});

redisClient.on("ready", () => {
  console.log(`Redis client ready`);
});

redisClient.on("error", (error) => {
  console.log(`X Redis client error X`, error);
});

export async function connectRedis(): Promise<void> {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  const pong = await redisClient.ping();
  console.log(`redis ping response: `, pong);
}

export async function disconnectRedis(): Promise<void>{
    if(redisClient.isOpen){
        await redisClient.quit();
    }
}