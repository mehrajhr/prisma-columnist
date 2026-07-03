import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import type { ICreatePost, IUpdatePost } from "./post.interface";

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

const getPostByID = async (postId: string) => {
  // const post = await prisma.post.findUniqueOrThrow({
  //   where: {
  //     id: postId,
  //   },
  // });

  // const updatedPost = await prisma.post.update({
  //   where: {
  //     id: postId,
  //   },
  //   data: {
  //     views: {
  //       increment: 1,
  //     },
  //   },
  //   include: {
  //     author: {
  //       omit: {
  //         password: true,
  //       },
  //     },
  //     comments: true,
  //   },
  // });

  const transationResult = await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: {
        id: postId,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    // throw new Error("Fake error ");

    const post = await tx.post.findUniqueOrThrow({
      where: {
        id: postId,
      },
      include: {
        author: {
          omit: {
            password: true,
          },
        },
        comments: {
          where: {
            status: CommentStatus.APPROVED,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    return post;
  });

  return transationResult;
};

const getMyPosts = async (authorId: string) => {
  const posts = await prisma.post.findMany({
    where: {
      authorId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      comments: true,
      author: {
        omit: {
          password: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  return posts;
};

const updatePost = async (
  postId: string,
  payload: IUpdatePost,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
  });

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("You don't have permission to update this post!");
  }

  const updatedPost = await prisma.post.update({
    where: {
      id: postId,
    },
    data: payload,
    include: {
      comments: true,
      author: {
        omit: {
          password: true,
        },
      },
    },
  });

  return updatedPost;
};

const deletePost = async (
  postId: string,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
  });

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("You don't have permit to delete this post .");
  }

  await prisma.post.delete({
    where: {
      id: postId,
    },
  });
};

const postStats = async () => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const totalPost = await tx.post.count();
    const totalPublishedPost = await tx.post.count({
      where: {
        status: PostStatus.PUBLISHED,
      },
    });
    const totalDraftPost = await tx.post.count({
      where: {
        status: PostStatus.DRAFT,
      },
    });
    const totalArchivedPost = await tx.post.count({
      where: {
        status: PostStatus.ARCHIVED,
      },
    });

    const totalApprovedComment = await tx.comment.count({
      where: {
        status: CommentStatus.APPROVED,
      },
    });

    const totalRejectedComment = await tx.comment.count({
      where: {
        status: CommentStatus.REJECT,
      },
    });

    const totalViews = await tx.post.aggregate({
      _sum: {
        views: true,
      },
    });

    const avgViews = await tx.post.aggregate({
      _avg: {
        views: true,
      },
    });

    return {
      totalPost,
      totalPublishedPost,
      totalArchivedPost,
      totalDraftPost,
      totalApprovedComment,
      totalRejectedComment,
      totalViews,
      avgViews,
    };
  });

  return transactionResult;
};

export const postService = {
  createPostInDB,
  getAllPostFromDB,
  getPostByID,
  getMyPosts,
  updatePost,
  deletePost,
  postStats,
};
