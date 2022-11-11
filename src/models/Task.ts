import { getModelForClass, prop as Property, Ref } from "@typegoose/typegoose";
import { TaskStatus, TaskPriority } from "../constants/enums";
import { User } from "./User";

export class Task {
  @Property({ ref: () => User })
  user: Ref<User>;

  @Property()
  title!: string;

  @Property()
  description!: string;

  @Property({
    enum: TaskStatus,
    type: String,
    default: TaskStatus.ToDo,
  })
  status!: TaskStatus;

  @Property({
    enum: TaskPriority,
    type: String,
    default: TaskPriority.Medium,
  })
  priority!: TaskPriority;

  _doc: any;
}

export const TaskModel = getModelForClass(Task, {
  schemaOptions: { timestamps: true },
});
