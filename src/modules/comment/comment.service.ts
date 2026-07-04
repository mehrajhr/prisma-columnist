import { prisma } from "../../lib/prisma";
import type { ICreateComment, IModerateComment } from "./comment.interface";

const createCommentInDB = async (payload: ICreateComment, authorId: string) => {
  const post = await prisma.post.findUnique({
    where: {
      id: payload.postId,
    },
  });

  if (!post) {
    throw new Error("The post doesn't exist !");
  }

  const comment = await prisma.comment.create({
    data: {
      content: payload.content,
      postId: payload.postId,
      authorId: authorId,
    },
  });

  return comment;
};

const moderateCommentInDB = async (id: string, payload: IModerateComment) => {
  const comment = await prisma.comment.findUnique({
    where: {
      id,
    },
  });

  if (!comment) {
    throw new Error("Sorry comment not exist in database!");
  }

  if (payload.status === comment.status) {
    throw new Error(
      `Your provided status ${payload.status} is already up to date.`,
    );
  }

  const updateComment = await prisma.comment.update({
    where: {
      id,
    },
    data: {
      status: payload.status,
    },
  });

  return updateComment;
};

const getCommentsByAuthorIdInDB = async (authorId: string) => {
  const author = await prisma.user.findUnique({
    where: {
      id: authorId,
    },
  });

  if (!author) {
    throw new Error(
      "Invalid author id . This author not exist in this system.",
    );
  }

  const comments = await prisma.comment.findMany({
    where: {
      authorId: authorId,
    },
  });

  return comments;
};

export const commentService = {
  createCommentInDB,
  moderateCommentInDB,
  getCommentsByAuthorIdInDB
};
