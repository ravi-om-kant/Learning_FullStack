import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { createUserTask, getUserTask } from '../services/user.task.service';

export const userTaskRouter = Router();

userTaskRouter.use(authenticate);

userTaskRouter.post("/", async (req, res, next) => {
    try {
        // if (!req.user) {
        //     return res.sendStatus(401);
        // }
        const task = await createUserTask(req.user!.userId, req.body.title);
        res.status(201).json({
            success: true,
            data: {
                task
            },
        })
    } catch (error) {
        next(error);
    }
});

userTaskRouter.get("/", async (req, res, next) => {
    try {
        const tasks = await getUserTask(req.user!.userId);
        res.status(200).json({
            success:true,
            data: {
                tasks
            }
        })
    } catch (error) {
        next(error);
    }
})