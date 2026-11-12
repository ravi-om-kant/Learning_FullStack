
import { Router } from "express";
import { healthRoute } from "./health.routes"; 
import { authRouter } from "./auth.routes";
import { userTaskRouter } from "./user.task.routes";

export const apiRouter = Router();

apiRouter.use(healthRoute);
apiRouter.use("/auth",authRouter);
apiRouter.use("/task", userTaskRouter);