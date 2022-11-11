import jwt from "jsonwebtoken";
import EnvVars from "../config/EnvVars";

export function encodeToken(userEmail: string, userId: string): string {
  return jwt.sign(
    {
      userEmail: userEmail,
      userId: userId,
    },
    EnvVars.jwt.secret,
    { expiresIn: EnvVars.jwt.exp }
  );
}

export function decodeToken(token: string): JwtPayload {
  return jwt.verify(token, EnvVars.jwt.secret) as JwtPayload;
}

export interface JwtPayload {
  userId: string;
  userEmail: string;
}
