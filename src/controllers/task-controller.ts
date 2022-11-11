import { validationResult } from "express-validator/check";

import { Response, NextFunction, Request } from "express";

import ApiError from "../models/api-error";
import HttpStatusCodes from "../constants/HttpStatusCodes";
import AuthService from "../services/auth-service";
import {
  checkForValidationErrors,
  isSomeEnumChecker,
} from "../utils/util-functions";
import { User } from "../models/User";
import { TaskPriority, TaskStatus } from "../constants/enums";
import TaskService from "../services/task-service";

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    checkForValidationErrors(req);

    const user_id = req.body.user_id as string;
    const { title, description, status, priority } = req.body;

    if (status && !isSomeEnumChecker(TaskStatus)(status)) {
      throw new ApiError("invalid status value", HttpStatusCodes.BAD_REQUEST, {
        accepted_values: Object.values(TaskStatus),
      });
    }

    if (priority && !isSomeEnumChecker(TaskPriority)(priority)) {
      throw new ApiError("invalid status value", HttpStatusCodes.BAD_REQUEST, {
        accepted_values: Object.values(TaskPriority),
      });
    }

    const task = await TaskService.queueCreateTask(
      user_id,
      title,
      description,
      {
        priority,
        status,
      }
    );

    res.status(HttpStatusCodes.OK).json({
      success: true,
      message: "In Progress",
    });
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    checkForValidationErrors(req);

    const user_id = req.body.user_id as string;
    const task_id = req.params.id;
    const { title, description, status, priority } = req.body;

    if (!isSomeEnumChecker(TaskStatus)(status)) {
      throw new ApiError("invalid status value", HttpStatusCodes.BAD_REQUEST, {
        accepted_values: Object.values(TaskStatus),
      });
    }

    if (!isSomeEnumChecker(TaskPriority)(priority)) {
      throw new ApiError("invalid status value", HttpStatusCodes.BAD_REQUEST, {
        accepted_values: Object.values(TaskPriority),
      });
    }

    const updated_task = await TaskService.updateTask(
      user_id,
      task_id,
      title,
      description,
      { priority, status }
    );

    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: {
        updated_task,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    checkForValidationErrors(req);

    const user_id = req.body.user_id as string;
    const task_id = req.params.id;

    const is_success = await TaskService.deleteTask(task_id, user_id);

    res.status(HttpStatusCodes.OK).json({
      success: is_success,
      message: "Task deleted",
    });
  } catch (err) {
    next(err);
  }
};

export const getUserTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    checkForValidationErrors(req);

    console.log(req.body);

    const user_id = req.body.user_id as string;

    const user_tasks = await TaskService.getUserTasks(user_id);

    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: {
        tasks: user_tasks,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getTaskById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    checkForValidationErrors(req);

    const user_id = req.body.user_id as string;
    const task_id = req.params.id;

    const task = await TaskService.getTaskById(task_id, user_id);

    res.status(HttpStatusCodes.OK).json({
      success: true,
      data: {
        task: task,
      },
    });
  } catch (err) {
    next(err);
  }
};
