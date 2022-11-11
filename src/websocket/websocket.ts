import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { assertion } from "@typegoose/typegoose/lib/internal/utils";

import { ExtendedError } from "socket.io/dist/namespace";
import { isAuthenticated } from "../middlewares/auth-middleware";

type CreateTaskFailedResponse = {
  user_id: string;
  title: string;
  error: any;
};

type CreateTaskSuccessResponse = {
  user_id: string;
  task_id: string;
  title: string;
};

interface ServerToClientEvents {
  acknowledged: (message: string) => void;
  error: (err: any) => void;
  create_task_failed: ({ user_id }: CreateTaskFailedResponse) => void;
  create_task_successful: ({ user_id }: CreateTaskSuccessResponse) => void;
}

interface ClientToServerEvents {}

const SocketEvents = {
  connect: "connection",
  disconnect: "disconnect",
  acknowledged: "acknowledged",
  error: "error",
  createTaskSuccessful: "create_task_successful",
  createTaskFailed: "create_task_failed",
} as const;

interface InterServerEvents {}

interface SocketData {}

const WEBSOCKET_CORS = {
  origin: "*",
  methods: ["GET", "POST"],
};

class Websocket extends Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> {
  private static io: Websocket;

  private constructor(httpServer?: HttpServer) {
    super(httpServer, {
      cors: WEBSOCKET_CORS,
      allowUpgrades: true,
    });
  }

  public static getInstance(httpServer?: HttpServer): Websocket {
    if (!Websocket.io) {
      assertion(
        httpServer,
        new Error("Http Server field required, on first usage of Websocket")
      );
      Websocket.io = new Websocket(httpServer);
    }

    return Websocket.io;
  }

  public static initializeDefaultListerner(httpServer: HttpServer) {
    const ioInstance = Websocket.getInstance(httpServer);
    ioInstance.use(this.middlewareWrapper(isAuthenticated));

    ioInstance.on(SocketEvents.connect, (socket) => {
      console.log("Client connected");
    });
  }

  static emitCreateTaskSuccessfulEvent(
    user_id: string,
    task_id: string,
    title: string
  ) {
    const io = Websocket.getInstance();

    const successResponse: CreateTaskSuccessResponse = {
      user_id,
      task_id,
      title,
    };
    io.emit(SocketEvents.createTaskSuccessful, successResponse);
  }

  static emitCreateTaskFailedEvent(user_id: string, title: string, error: any) {
    const io = Websocket.getInstance();

    const createTaskedFailedResponse: CreateTaskFailedResponse = {
      user_id,
      title,
      error,
    };
    io.emit(SocketEvents.createTaskFailed, createTaskedFailedResponse);
  }

  private static handleError(socket: Socket, err: any) {
    console.log(err);
    socket.emit(SocketEvents.error, {
      message: err.message,
      status: err.status || 500,
      extra_info: err.extra_info || [],
    });
  }

  private static middlewareWrapper =
    (middleware: Function) => (socket: Socket, next: SocketNextFunction) =>
      middleware(socket.request, {}, next);
}

type SocketNextFunction = (err?: ExtendedError | undefined) => void;

export default Websocket;
