import { validationResult } from "express-validator/check";

import { Response, NextFunction, Request } from "express";

import ApiError from "../models/api-error";
import HttpStatusCodes from "../constants/HttpStatusCodes";
import AuthService from "../services/auth-service";
import { checkForValidationErrors } from "../utils/util-functions";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    checkForValidationErrors(req);

    const { email, first_name, last_name, password } = req.body;

    const user = await AuthService.createUser(
      email,
      first_name,
      last_name,
      password
    );
    res.status(201).json({
      success: true,
      data: {
        user: user.personalProfile!(),
      },
    });
  } catch (err) {
    let error = err as ApiError;
    if (!error.status) {
      error.status = 500;
    }
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    checkForValidationErrors(req);

    const { email, password } = req.body;
    const [user, token] = await AuthService.login(email, password);

    res.status(200).json({
      success: true,
      data: { token: token, user: user.personalProfile!() },
    });
  } catch (err) {
    let error = err as ApiError;
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};
