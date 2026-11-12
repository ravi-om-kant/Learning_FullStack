import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppErrors";

export function requireAdmin(
    req:Request,
    _res: Response,
    next: NextFunction
): void{
    if(req.user?.role !== "ADMIN"){
        next(new AppError(403, "Admin access required. You don't have specific permission to perform this activity!"));
        return;
    }
    next();
}