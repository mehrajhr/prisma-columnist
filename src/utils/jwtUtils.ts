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

export const jwtUtils = {
  createToken,
};
