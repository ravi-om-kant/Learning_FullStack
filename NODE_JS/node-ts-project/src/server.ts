// main root file

import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./libs/logger";
import { connectRedis, disconnectRedis } from "./redis/client";

const app = createApp();
const PORT = env.port || 5000;

async function startServer() {
  try {
    // await connectRedis();
    app.listen(env.port, () => {
      logger.info(`Server is running on port http://localhost:${env.port}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error}`);
    process.exit(1);
  }
}
/*
process.on("SIGINT", async () => {
    await disconnectRedis();
    process.exit(0);
})*/
startServer();