import type { Application, Request, Response } from "express";
import express from "express";
import cors from "cors";
import config from "./config";
import cookieParser from "cookie-parser";
import httpStatus from "http-status";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello world!");
});

app.post("/api/users/register", async (req: Request, res: Response) => {
  const payload = req.body;
  const { name, email, password, profilePhoto } = payload;

  // console.log(payload);

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
      name ,
      email,
      password : hashPassword
    }
  })

  await prisma.profile.create({
    data: {
      userId : createdUser.id,
      profilePhoto
    }
  })

  const user = await prisma.user.findUnique({
    where :{
      email : createdUser.email || email,
      id : createdUser.id
    },
    omit: {
      password : true 
    },
    include:{
      profile: true
    }
  })


  res.status(httpStatus.CREATED).json({
    success : true,
    message : "User created succesfully",
    data : {
      user
    }
  });
});

export default app;
