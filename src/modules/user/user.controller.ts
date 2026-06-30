import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { userService } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { jwtUtils } from "../../utils/jwtUtils";
import config from "../../config";

const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const user = await userService.registerUserInDB(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User registered succesfully",
      data: { user },
    });
  },
);

const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const profile = await userService.getUserInDB(req.user?.id as string);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User profile fetched succesfully",
      data: { profile },
    });
  },
);

export const userController = {
  registerUser,
  getUser,
};
