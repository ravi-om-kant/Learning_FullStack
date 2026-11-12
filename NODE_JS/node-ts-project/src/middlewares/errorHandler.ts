import { Request,Response, NextFunction } from "express";
import { logger } from "../libs/logger";
import { AppError } from "../errors/AppErrors";
// export function errorhandler({
export function errorhandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void{
    logger.info({err}, "Unhandled error");


    if(err instanceof AppError){
        res.status(err.statusCode).json({
            success: true,
            message: err.message
        });
    }

    res.status(500).json({
        success: false,
        message: "Internal Server Error!!"
    })
}