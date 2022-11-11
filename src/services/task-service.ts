import { QueueNames, TaskPriority, TaskStatus } from "../constants/enums";
import HttpStatusCodes from "../constants/HttpStatusCodes";
import ApiError from "../models/api-error";
import { Task, TaskModel } from "../models/Task";
import { UserModel } from "../models/User";
import Websocket from "../websocket/websocket";
import { publishToQueue } from "./mq-service";

interface TaskStatusAndPriotity {
  status?: TaskStatus;
  priority?: TaskPriority;
}

export default class TaskService {
  static async queueCreateTask(
    user_id: string,
    title: string,
    description: string,
    {
      status = TaskStatus.ToDo,
      priority = TaskPriority.Medium,
    }: TaskStatusAndPriotity
  ): Promise<boolean> {
    const user = await UserModel.findById(user_id);

    if (!user) {
      throw new ApiError("User with id not found");
    }

    const task = {
      user_id,
      title,
      description,
      status,
      priority,
    };

    publishToQueue(QueueNames.CREATE_TASK, task);

    return true;
  }

  static async createTask(
    user_id: string,
    title: string,
    description: string,
    {
      status = TaskStatus.ToDo,
      priority = TaskPriority.Medium,
    }: TaskStatusAndPriotity
  ): Promise<boolean> {
    try {
      const user = await UserModel.findById(user_id);

      if (!user) {
        throw new ApiError("User with id not found");
      }

      const task = await TaskModel.create({
        user: user_id,
        title,
        description,
        status,
        priority,
      });

      Websocket.emitCreateTaskSuccessfulEvent(user_id, task.id, task.title);

      return true;
    } catch (err) {
      Websocket.emitCreateTaskFailedEvent(user_id, title, err);
      
      return false;
    }
  }

  static async updateTask(
    user_id: string,
    task_id: string,
    title: string,
    description: string,
    {
      status = TaskStatus.ToDo,
      priority = TaskPriority.Medium,
    }: TaskStatusAndPriotity
  ) {
    const task = await TaskModel.findOneAndUpdate(
      {
        id: task_id,
        user: user_id,
      },
      {
        title,
        description,
        status,
        priority,
      },
      {
        new: true,
      }
    );

    if (!task) {
      throw new ApiError(
        "Task not found. Please enter a valid task id",
        HttpStatusCodes.NOT_FOUND
      );
    }

    return task;
  }

  /** We pass task id and user_id because users should not be able to delete tasks that belong to other users */
  static async deleteTask(task_id: string, user_id: string): Promise<boolean> {
    const deletedTask = await TaskModel.findOneAndDelete({
      _id: task_id,
      user: user_id,
    });

    console.log(deletedTask);

    if (!deletedTask) {
      throw new ApiError("Task not found.", HttpStatusCodes.NOT_FOUND);
    }

    return true;
  }

  static async getUserTasks(user_id: string): Promise<Task[]> {
    const tasks = await TaskModel.find({
      user: user_id,
    });

    return tasks;
  }

  /** We pass task id and user_id because users should only be able to get tasks that belong to them */
  static async getTaskById(task_id: string, user_id: string): Promise<Task> {
    const task = await TaskModel.findOne({
      $and: [{ _id: task_id }, { user: user_id }],
    });

    if (!task) {
      throw new ApiError("Task not found", HttpStatusCodes.NOT_FOUND);
    }

    return task;
  }
}
