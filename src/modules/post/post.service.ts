import { prisma } from "../../lib/prisma";
import type { ICreatePost } from "./post.interface";

const createPostInDB = async (userId: string, payload: ICreatePost) => {
  const result = await prisma.post.create({
    data: {
      ...payload,
      authorId: userId,
    },
  });
  return result;
};

export const postService = {
  createPostInDB,
};
