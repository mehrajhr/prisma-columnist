import type { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import type { IPostQuery } from "../post/post.interface";

const getPremiumContent = async (query: IPostQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const andConditons: PostWhereInput[] = [];

  if (query.searchTerm) {
    andConditons.push({
      OR: [
        {
          title: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (query.title) {
    andConditons.push({
      title: query.title,
    });
  }

  if (query.content) {
    andConditons.push({
      content: query.content,
    });
  }

  if (query.authorId) {
    andConditons.push({
      authorId: query.authorId,
    });
  }

  if (query.isFeatured) {
    andConditons.push({
      isFeatured: Boolean(query.isFeatured),
    });
  }

  const tags = query.tags ? JSON.parse(query.tags as string) : null;

  const tagsArray = Array.isArray(tags) ? tags : [];

  if (query.tags) {
    andConditons.push({
      tags: {
        hasSome: tagsArray,
      },
    });
  }

  if (query.status) {
    andConditons.push({
      status: query.status,
    });
  }

  andConditons.push({
    isPremium: true,
  });
  const posts = await prisma.post.findMany({
    where: {
      AND: andConditons,
    },

    // dynamic sorting , pagination
    take: limit,
    skip: skip,

    orderBy: {
      [sortBy]: sortOrder,
    },

    include: {
      author: {
        omit: {
          password: true,
        },
      },
      comments: true,
    },
  });

  const totalPOstCount = await prisma.post.count({
    where: {
      AND: andConditons,
    },
  });

  // console.log(posts)
  return {
    data: posts,
    meta: {
      page: page,
      limit: limit,
      total: totalPOstCount,
      totalPages: Math.ceil(totalPOstCount / limit),
    },
  };
};

export const premiumService = {
  getPremiumContent,
};
