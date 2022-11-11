import ApiError from "../models/api-error";
import { Request, Response, NextFunction } from "express";
import { Error as MongoError } from "mongoose";

export const errorHandler = (
  error: any,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  console.log("Error Occured!!!");
  console.log(error);

  if (error instanceof MongoError.CastError) {
    // Mongoose bad or incorrect objectID
    const message = `ID ${error.value} is not a valid Mongoose Object ID`;
  } else if (error instanceof MongoError.ValidationError) {
    // Mongoose validation error
    const errorMessages = Object.values(error.errors).map((val) => val.message);
    error = new ApiError("Validation Error", 400, errorMessages);
  } else if (error.code && error.code === 11000) {
    /// Mongoose duplicate key
    console.log(error);
    const message = `Duplicate value`; //A duplicate field value entered
    error = new ApiError(message, 400, [error.keyPattern]);
  }

  const status = error.status || 500;
  const message = error.message;
  return response.status(status).json({
    success: false,
    message: message,
    extra_info: error.extra_info || [],
  });
};

export const error404Handler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
};
