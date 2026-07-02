import { Router } from "express";
import { postsController } from "./post.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/",
  auth(Role.ADMIN, Role.AUTHOR, Role.USER),
  postsController.createPost,
);

router.get("/", postsController.getAllPost);
router.get(
  "/my-posts",
  auth(Role.ADMIN, Role.USER, Role.AUTHOR),
  postsController.getMyPosts,
);
router.get("/:postId", postsController.getPostByID);

export const postsRoutes = router;
