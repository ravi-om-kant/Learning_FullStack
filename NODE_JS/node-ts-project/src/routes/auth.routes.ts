import { Router } from "express";
import { loginUser, registerUser } from "../services/auth.service";
import { logger } from "../libs/logger";
import { authenticate } from "../middlewares/auth.middleware";

export const authRouter = Router();

authRouter.post('/register', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        await registerUser(email, password);
        res.status(201).json({
            success: true,
            message: "Registration successfull. Please login to continue."
        })
    } catch (error) {
        next(error);
    }
});

authRouter.post('/login', async (req, res, next) => {
    logger.info("--------------------------------", req.body)
    try {
        const { email, password } = req.body;
        const { accessToken } = await loginUser(email, password);
        res.status(200).json({
            success: true,
            data: {accessToken}
        })
    } catch (error) {
        next(error);
    }
});

authRouter.get('/me',authenticate, async (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            user: req.user,
        }
    });
});