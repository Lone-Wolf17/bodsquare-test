import { Response, Request } from "express";

import ApiError from "../models/api-error";
import { decodeToken } from "./jwt-service.middleware";
import HttpStatusCodes from "../constants/HttpStatusCodes";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: Function
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      const error = new ApiError(
        "Not Authenticated.",
        HttpStatusCodes.UNAUTHORIZED
      );
      throw error;
    }
    const token = authHeader.split(" ")[1];
    let decodedToken = decodeToken(token);

    if (!decodedToken) {
      const error = new ApiError(
        "Not Authenticated.",
        HttpStatusCodes.UNAUTHORIZED
      );
      throw error;
    }

    if (!req.body) {
      req.body = {};
    }
    req.body.user_id = decodedToken.userId;

    next();
  } catch (err: any) {
    let error = err as ApiError;
    error.status = 500;
    next(error);
  }
};
