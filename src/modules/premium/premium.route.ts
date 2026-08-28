import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { premiumController } from "./premium.controller";
import { auth } from "../../middlewares/auth";
import { Role, SubscriptionStatus } from "../../../generated/prisma/enums";
import { catchAsync } from "../../utils/catchAsync";
import { prisma } from "../../lib/prisma";
import { premiumGuard } from "../../middlewares/premiumGuard";

const router = Router();

router.get(
  "/",
  auth(Role.USER, Role.ADMIN, Role.AUTHOR),
  premiumGuard(),
  premiumController.getPremiumContent,
);

export const premiumRoutes = router;
