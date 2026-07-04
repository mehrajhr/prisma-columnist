import { prisma } from "../../lib/prisma";
import type { ICreateComment } from "./comment.interface";

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

export const commentService = {
  createCommentInDB,
};
