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

const getAllPostFromDB = async () => {
  const posts = await prisma.post.findMany({
    include: {
      author: {
        omit: {
          password: true,
        },
      },
      comments: true,
    },
  });
  return posts;
};
export const postService = {
  createPostInDB,
  getAllPostFromDB,
};
