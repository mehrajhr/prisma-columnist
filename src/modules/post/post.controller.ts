import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { postService } from "./post.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id;
    const payload = req.body;
    const result = await postService.createPostInDB(id as string, payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Post created successfully.",
      data: result,
    });
  },
);

const getAllPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    // console.log(query);
    const result = await postService.getAllPostFromDB(query);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Data fetched successfully",
      data: result,
    });
  },
);

const getPostByID = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;

    if (!postId) {
      throw new Error("Post id required in params .");
    }
    const post = await postService.getPostByID(postId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Data fetched successfully.",
      data: { post },
    });
  },
);

const getMyPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.user?.id;
    const posts = await postService.getMyPosts(authorId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Data fetched successfully",
      data: posts,
    });
  },
);

const updatePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const payload = req.body;
    const isAdmin = req.user?.role === "ADMIN";
    const authorId = req.user?.id;

    const result = await postService.updatePost(
      postId as string,
      payload,
      authorId as string,
      isAdmin,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Post Updated Successfully.",
      data: result,
    });
  },
);

const deletePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const authorId = req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";

    await postService.deletePost(postId as string, authorId as string, isAdmin);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Post deleted successfully.",
      data: null,
    });
  },
);

const postStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await postService.postStats();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Stats of posts retrieved successfully",
      data: result,
    });
  },
);

export const postsController = {
  createPost,
  getAllPost,
  getPostByID,
  getMyPosts,
  updatePost,
  deletePost,
  postStats,
};
