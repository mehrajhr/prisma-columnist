import type { payloadRegisterUser } from "./user.interface";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import config from "../../config";
import { profile } from "node:console";

const registerUserInDB = async (payload: payloadRegisterUser) => {
  const { name, email, password, profilePhoto } = payload;

  const isUserExist = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExist) {
    throw new Error("User with this email already exist ");
  }

  const hashPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashPassword,
    },
  });

  await prisma.profile.create({
    data: {
      userId: createdUser.id,
      profilePhoto,
    },
  });

  const user = await prisma.user.findUnique({
    where: {
      email: createdUser.email || email,
      id: createdUser.id,
    },
    omit: {
      password: true,
    },
    include: {
      profile: true,
    },
  });

  return user;
};

const getUserInDB = async (id: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: id },
    omit: {
      password: true,
    },
    include: {
      profile: true,
    },
  });


  return user
};

export const userService = {
  registerUserInDB,
  getUserInDB,
};
