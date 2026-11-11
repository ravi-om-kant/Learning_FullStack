
import { Router } from "express";
import { healthRoute } from "./health.routes"; 

export const apiRouter = Router();

apiRouter.use(healthRoute);