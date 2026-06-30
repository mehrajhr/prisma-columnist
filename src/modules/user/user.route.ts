import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { userController } from "./user.controller";
import { jwtUtils } from "../../utils/jwtUtils";
import config from "../../config";
import { Role } from "../../../generated/prisma/enums";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        name: string;
        id: string;
        role: Role;
      };
    }
  }
}

const router = Router();

router.post("/register", userController.registerUser);
router.get(
  "/me",
  (req: Request, res: Response, next: NextFunction) => {
    const { accessToken } = req.cookies;

    const verifiedToken = jwtUtils.verifyToken(
      accessToken,
      config.jwt_access_secret,
    );

    if (typeof verifiedToken === "string") {
      throw new Error(verifiedToken);
    }

    const { email, name, id, role } = verifiedToken;

    const requiredRoles = [Role.ADMIN, Role.AUTHOR, Role.USER];

    if (!requiredRoles.includes(role)) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.FORBIDDEN,
        message: "Forbidden! You don't have access to this route ",
      });
    }

    req.user = {
      name,
      email,
      id,
      role,
    };

    next();
  },
  userController.getUser,
);

export const userRoutes = router;
