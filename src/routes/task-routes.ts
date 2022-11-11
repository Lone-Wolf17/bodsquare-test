import { Router } from "express";
import { body } from "express-validator";
import { TaskPriority, TaskStatus } from "../constants/enums";

import * as TaskController from "../controllers/task-controller";
import { isAuthenticated } from "../middlewares/auth-middleware";
import ApiError from "../models/api-error";
import { User } from "../models/User";
import { isSomeEnumChecker } from "../utils/util-functions";

const router = Router();

router.post(
  "/",
  isAuthenticated,
  [
    body("title").trim().not().isEmpty(),
    body("description").trim().not().isEmpty(),
    body("status")
      .custom((value) => {
        if (!isSomeEnumChecker(TaskStatus)(value)) {
          throw new Error("invalid status value");
        }

        return true;
      })
      .optional({ nullable: true }),
    body("priority")
      .custom((value) => {
        if (!isSomeEnumChecker(TaskPriority)(value)) {
          throw new Error("invalid priority value");
        }

        return true;
      })
      .optional({ nullable: true }),
  ],
  TaskController.createTask
);
router.put(
  "/:id",
  isAuthenticated,
  [
    body("title").trim().not().isEmpty(),
    body("description").trim().not().isEmpty(),
    body("status").custom((value) => {
      if (!isSomeEnumChecker(TaskStatus)(value)) {
        throw new Error("invalid status value");
      }

      return true;
    }),
    body("priority").custom((value) => {
      if (!isSomeEnumChecker(TaskPriority)(value)) {
        throw new Error("invalid priority value");
      }

      return true;
    }),
  ],
  TaskController.updateTask
);
router.get("/", isAuthenticated, TaskController.getUserTasks);
router.get("/:id", isAuthenticated, TaskController.getTaskById);

router.delete("/:id", isAuthenticated, TaskController.deleteTask);

export default router;
