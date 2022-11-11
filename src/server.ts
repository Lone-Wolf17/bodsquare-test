import "./services/mq-service";

import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import express from "express";
import { createServer } from "http";

import BaseRouter from "./routes/index";
import EnvVars from "./config/EnvVars";
import { NodeEnvs } from "./constants/enums";
import { error404Handler, errorHandler } from "./middlewares/error-middleware";
import { mongoConnect } from "./config/db-config";
import Websocket from "./websocket/websocket";

// **** Init express **** //

const app = express();

// set up socket io

// set up socket io
const httpServer = createServer(app);
Websocket.initializeDefaultListerner(httpServer);

// **** Set basic express settings **** //

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(EnvVars.cookieProps.secret));

// Show routes called in console during development
if (EnvVars.nodeEnv === NodeEnvs.Dev) {
  app.use(morgan("dev"));
}

// Security
if (EnvVars.nodeEnv === NodeEnvs.Production) {
  app.use(helmet());
}

// **** Add API routes **** //

// Add APIs
app.use("/api", BaseRouter);

// Middlewares are linear. It must appear after all the routes that need it have been mounted
app.use(error404Handler);
app.use(errorHandler);

// connect to DB
mongoConnect(() => {
  console.log(`🚀 Server ready!!! `);
});

// **** Export default **** //

export default httpServer;


