import { getModelForClass, prop as Property } from "@typegoose/typegoose";

export class User {
  @Property({ required: true })
  first_name!: string;

  @Property({ required: true })
  last_name!: string;

  @Property({ required: true, unique: true })
  email!: string;

  @Property({ required: true, minlength: 8, select: false })
  password_hash!: string;

  id!: string;
  _doc: any;

  /// Defines the user data we want to return client.
  /// helps prevent exposing sensitive data
  personalProfile?(): PersonalProfile {
    return {
      id: this.id,
      email: this.email,
      first_name: this.first_name,
      last_name: this.last_name,
    };
  }
}

export const UserModel = getModelForClass(User, {
  schemaOptions: { timestamps: true },
});

/// Describes the user properties we want to return to the client
export type PersonalProfile = Omit<
  User,
  | "password_hash"
  | "_doc"
>;