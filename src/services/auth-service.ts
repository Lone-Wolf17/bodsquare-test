import bcrypt from "bcryptjs";

import HttpStatusCodes from "../constants/HttpStatusCodes";
import { encodeToken } from "../middlewares/jwt-service.middleware";
import ApiError from "../models/api-error";
import { User, UserModel } from "../models/User";

export default class AuthService {
  static async createUser(
    email: string,
    first_name: string,
    last_name: string,
    password: string
  ): Promise<User> {
    const existingUser = await UserModel.findOne({ email: email });
    if (existingUser) {
      const error = new ApiError(
        "User already Exists",
        HttpStatusCodes.FORBIDDEN
      );
      throw error;
    }

    const password_hash = await bcrypt.hash(password, 12);

    const user = await UserModel.create({
      email,
      password_hash,
      first_name,
      last_name,
    });

    return user;
  }

  static async login(email: string, password: string): Promise<[User, string]> {
    const user = await UserModel.findOne({ email: email }).select(
      "+password_hash"
    );
    if (!user) {
      const error = new ApiError(
        "A user with this email could not be found.",
        HttpStatusCodes.UNAUTHORIZED
      );
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password_hash);
    if (!isEqual) {
      const error = new ApiError(
        "Wrong password!",
        HttpStatusCodes.UNAUTHORIZED
      );
      throw error;
    }
    const token = encodeToken(user.email, user._id.toString());

    return [user, token];
  }
}
