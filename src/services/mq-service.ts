import amqp from "amqplib/callback_api";
import EnvVars from "../config/EnvVars";
import { QueueNames } from "../constants/enums";
import TaskService from "./task-service";

let channel: amqp.Channel | null = null;
amqp.connect(EnvVars.RABBIT_MQ_URL, function (err, conn) {
  if (err) throw err;

  // create publisher
  conn.createChannel(function (err, ch) {
    if (err) throw err;

    channel = ch;
    channel.assertQueue(QueueNames.CREATE_TASK);
    console.log("Rabbit MQ connected");
  });

  // create consumer
  conn.createChannel((err, ch2) => {
    if (err) throw err;

    ch2.assertQueue(QueueNames.CREATE_TASK);

    ch2.consume(QueueNames.CREATE_TASK, async (msg) => {
      if (msg) {
        console.log("Message:", msg.content.toString());
        const obj = JSON.parse(msg.content.toString());
        const { user_id, title, description, status, priority } = obj;

        const successful = await TaskService.createTask(
          user_id,
          title,
          description,
          {
            status,
            priority,
          }
        );

        if (successful) {
          ch2.ack(msg);
        }
      }
    });
  });
});

export const publishToQueue = async (queueName: string, data: any) => {
  if (!channel) {
    console.log("Channel is null!!");
  }
  channel!.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
};
process.on("exit", (code) => {
  if (channel) {
    channel.close((err) => console.log("Error closing channel: \n", err));
    console.log(`Closing rabbitmq channel`);
  }
});
