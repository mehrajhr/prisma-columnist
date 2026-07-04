import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { commentController } from "./comment.controller";

const router = Router();

router.get("/author/:authorId", commentController.getCommentsByAuthorID);

router.post(
  "/",
  auth(Role.USER, Role.ADMIN, Role.AUTHOR),
  commentController.createComment,
);

router.patch(
  "/:commentId/moderate",
  auth(Role.ADMIN),
  commentController.moderateComment,
);

export const commentRoutes = router;
