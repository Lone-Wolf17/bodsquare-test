export enum NodeEnvs {
  Dev = "development",
  Staging = "staging",
  Production = "production",
}

export enum TaskStatus {
  ToDo = "todo",
  Done = "done",
  InProgress = "in-progress",
  Canceled = "canceled",
}

export enum TaskPriority {
  Low = "low",
  Medium = "medium",
  High = "high",
}

export const QueueNames = {
  CREATE_TASK : "create-task" 
} as const;