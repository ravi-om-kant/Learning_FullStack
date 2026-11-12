import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppErrors";
import { verifyAccessToken } from "../libs/jwt";
export function authenticate(
    req: Request,
    _res: Response,
    next: NextFunction
): void {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        next(new AppError(401, "Access token is required!"));
        return;
    }

    const token = authHeader.split(" ")[1];
    req.user = verifyAccessToken(token);

    // exp imp
    next();
}