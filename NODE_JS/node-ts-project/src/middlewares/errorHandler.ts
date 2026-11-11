import { Request,Response, NextFunction } from "express";
import { logger } from "../libs/logger";
// export function errorhandler({
export function errorhandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void{
    logger.info({err}, "Unhandled error");

    res.status(500).json({
        success: false,
        message: "Internal Server Error!!"
    })
}