import type { NextFunction, Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import { userService } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";

const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const user = await userService.registerUserInDB(payload);

    res.status(httpStatus.CREATED).json({
      success: true,
      message: "User created succesfully",
      data: {
        user,
      },
    });
  },
);

export const userController = {
  registerUser,
};
