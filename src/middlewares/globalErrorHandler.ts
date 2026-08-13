import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
    console.log(err);

    let statusCode;
    let errorMessage = err.message || "Internal Server Error";

    if(err instanceof Prisma.PrismaClientValidationError){
          statusCode = httpStatus.BAD_REQUEST;
          errorMessage = "You have provided incorrect field type or missing field"
    }
  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    statusCode: statusCode || httpStatus.INTERNAL_SERVER_ERROR,
    message: errorMessage,
    error: err,
  });
};
