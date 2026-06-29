import type { JwtPayload, SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";

const createToken = (
  payload: JwtPayload,
  secret: string,
  expiresIn: SignOptions,
) => {
  return jwt.sign(payload, secret, {
    expiresIn: expiresIn,
  } as SignOptions);
};

const verifyToken = (token: string, secret: string) => {
  try {
    const verifiedToken = jwt.verify(token, secret);
    return verifiedToken;
  } catch (error: any) {
    throw new Error("Invalid Token");
  }
};

export const jwtUtils = {
  createToken,
  verifyToken,
};
