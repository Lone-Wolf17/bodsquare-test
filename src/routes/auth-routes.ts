import { Router } from "express";
import { body } from "express-validator";

import * as AuthController from "../controllers/auth-controller";

const router = Router();

router.post(
  "/register",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .normalizeEmail(),
    body("password").trim().isLength({ min: 8 }),
    body("first_name").trim().not().isEmpty(),
    body("last_name").trim().not().isEmpty(),
  ],
  AuthController.register
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .normalizeEmail(),
    body("password").trim().not().isEmpty(),
  ],
  AuthController.login
);

export default router;
