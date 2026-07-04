import type { CommentStatus } from "../../../generated/prisma/enums";

export interface ICreateComment {
  content: string;
  postId: string;
}

export interface IModerateComment {
  status: CommentStatus;
}
