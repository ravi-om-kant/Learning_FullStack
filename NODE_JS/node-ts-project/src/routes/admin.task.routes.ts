import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';
import { getAdminTask } from '../services/admin.task.service';

export const adminTaskRouter = Router();

adminTaskRouter.use(authenticate, requireAdmin);

adminTaskRouter.get("/", async (req, res, next) => {
    try {
        const data = await getAdminTask(req.query);
        res.status(200).json({
            success: true,
            data
        })
    } catch (error) {
        next(error);
    }
})
