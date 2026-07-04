import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { commentService } from "./comment.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const authorId = req.user?.id;

    const result = await commentService.createCommentInDB(
      payload,
      authorId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Comment created Successfully",
      data: result,
    });
  },
);

const moderateComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const commentId = req.params.commentId;
    const payload = req.body;

    const result = await commentService.moderateCommentInDB(
      commentId as string,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Comment moderate successfully",
      data: result,
    });
  },
);

const getCommentsByAuthorID = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { authorId } = req.params;

    const result = await commentService.getCommentsByAuthorIdInDB(
      authorId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Data fetched successfully",
      data: result,
    });
  },
);

const getCommentsById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { commentId } = req.params;

    const result = await commentService.getCommentById(commentId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Data fetched successfully",
      data: result,
    });
  },
);

const updateComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { commentId } = req.params;
    const payload = req.body;

    const result = await commentService.updateCommentInDB(
      userId as string,
      commentId as string,
      payload,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Comment updated successfully.",
      data: result,
    });
  },
);

const deleteComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const commentId = req.params.commentId;
    await commentService.deleteCommentInDB(
      userId as string,
      commentId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Comment deleted successfully.",
      data: null,
    });
  },
);

export const commentController = {
  createComment,
  moderateComment,
  getCommentsByAuthorID,
  getCommentsById,
  updateComment,
  deleteComment
};
