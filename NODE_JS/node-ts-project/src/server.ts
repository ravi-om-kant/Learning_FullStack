// main root file

import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./libs/logger";


const app = createApp();

app.listen(env.port, () => {
    logger.info(`Server is running on port http://localhost:${env.port}`)
});