import mongoose, { ConnectOptions } from "mongoose";
import EnvVars from "./EnvVars";

export const mongoConnect = (callback: Function) => {
  return mongoose
    .connect(EnvVars.MONGO_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      autoIndex: true,
    } as ConnectOptions)
    .then((client) => {
      console.log("Database Connected!");
      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};
