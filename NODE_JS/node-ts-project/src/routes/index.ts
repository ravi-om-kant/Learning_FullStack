
import { Router } from "express";
import { healthRoute } from "./health.routes"; 
import { authRouter } from "./auth.routes";
import { userTaskRouter } from "./user.task.routes";
import { adminTaskRouter } from "./admin.task.routes";

export const apiRouter = Router();

apiRouter.use(healthRoute);
apiRouter.use("/auth",authRouter);
apiRouter.use("/tasks", userTaskRouter);
apiRouter.use("/admin/tasks", adminTaskRouter);

