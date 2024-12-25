import chalk from "chalk";
import { v4 as uuidv4 } from "uuid";
import { WebSocketServer, WebSocket } from "ws";
import { EventEmitter } from "events";
import { ConnectionManager } from "../lib/connection-manager.js";

export default class MinecraftConnection extends EventEmitter {
  private static _instance: MinecraftConnection;
  private readonly _wss: WebSocketServer;
  private readonly _connectionManager: ConnectionManager;
  private _timeOut: number = 5000;
  private _sendQueue: Message[] = [];
  private _awaitedQueue: {
    [key: string]: { message: any; timeoutId: NodeJS.Timeout };
  } = {};

  /**
   * Creates a new Minecraft connection.
   * @param {WebSocketServer} wss The WebSocket server instance.
   * @param {ConnectionManager} connectionManager The connection manager instance.
   */
  private constructor(
    wss: WebSocketServer,
    connectionManager: ConnectionManager
  ) {
    super();
    this._wss = wss;
    this._connectionManager = connectionManager;
    this.connect();
  }

  /**
   * Returns the Minecraft connection instance.
   * @param {WebSocketServer} wss The WebSocket server instance.
   * @param {ConnectionManager} connectionManager The connection manager instance.
   * @returns {MinecraftConnection} The Minecraft connection instance.
   */
  public static instance(
    wss: WebSocketServer,
    connectionManager: ConnectionManager
  ): MinecraftConnection {
    if (!MinecraftConnection._instance) {
      MinecraftConnection._instance = new MinecraftConnection(
        wss,
        connectionManager
      );
    }
    return MinecraftConnection._instance;
  }

  /**
   * Connects to the Minecraft.
   */
  private connect(): void {
    this._wss.on("connection", (ws) => {
      this.sendCommand("playsound random.levelup");

      ws.on("message", (message) => {
        try {
          this.handleMessage(message);
        } catch (error) {
          console.error(
            chalk.yellowBright(`Failed to parse message: ${error.message}`)
          );
          console.error(chalk.yellowBright(`Message: ${message}`));
        }
      });

      ws.on("error", (error) => {
        console.error(chalk.red(`Minecraft connection error: ${error}`));
      });
      ws.on("close", () => {
        console.log(chalk.yellowBright("Minecraft connection closed."));
      });

      this.emit("connected");
    });
  }

  private processSendQueue(): void {
    // Get the first connection
    const connection = Array.from(
      this._connectionManager.getConnections().values()
    )[0];
    if (!connection) return;

    const MAX_QUEUE_SIZE = 100;
    const awaitedQueueLength = Object.keys(this._awaitedQueue).length;
    const sendQueueLength = this._sendQueue.length;

    let count = Math.min(MAX_QUEUE_SIZE - awaitedQueueLength, sendQueueLength);

    for (let i = 0; i < count; i++) {
      const command = this._sendQueue.shift();

      try {
        connection.send(JSON.stringify(command));

        const timeoutId = setTimeout(() => {
          if (command) {
            console.log(`Command timed out: ${command.body.commandLine}`);
            delete this._awaitedQueue[command.header.requestId];
            this.processSendQueue();
          }
        }, this._timeOut);

        if (!command) return;

        this._awaitedQueue[command.header.requestId] = {
          message: command,
          timeoutId,
        };
      } catch (error) {
        console.error(chalk.red(`Failed to send command: ${error}`));
        continue;
      }
    }
  }

  /**
   * Enqueues a command to be sent to Minecraft.
   * @param {string} message The message to enqueue.
   */
  private enqueueCommand(message: any): void {
    this._sendQueue.push(message);
    this.processSendQueue();
  }

  /**
   * Handles command response.
   * @param {string} message The command response message.
   */
  private handleCommandResponse(message: any): void {
    if (typeof message !== "object" && !message.header && !message.body) {
      console.warn(
        chalk.yellow("Received invalid command response message: ", message)
      );
      return;
    }

    const requestId = message.header.requestId;
    if (!(requestId in this._awaitedQueue)) return;

    const statusCode = message.body.statusCode;
    const commandLine = this._awaitedQueue[requestId].message.body.commandLine;

    if (statusCode < 0) {
      const statusMessage =
        message.body.statusMessage || "No status message provided";
      console.log(chalk.red(`Error: ${commandLine} - ${statusMessage}`));
    }

    if (requestId in this._awaitedQueue) {
      clearTimeout(this._awaitedQueue[requestId].timeoutId);
      delete this._awaitedQueue[requestId];
    }

    this.processSendQueue();
  }

  /**
   * Handles a Minecraft message.
   * @param {string} message The Minecraft message to handle.
   */
  private handleMessage(message: any): void {
    const msg = JSON.parse(message);

    if (!msg.header || !msg.header.messagePurpose) {
      console.warn(
        chalk.yellow(`Received message without a valid header: ${message}`)
      );
      return;
    }

    if (msg.header.messagePurpose === "event") {
      this.handleEvent(msg);
    } else if (msg.header.messagePurpose === "commandResponse") {
      this.handleCommandResponse(msg);
    } else {
      console.warn(
        chalk.yellow(`Unknown message purpose: ${msg.header.messagePurpose}`)
      );
    }
  }

  /**
   * Handles Minecraft event.
   * @param message The Minecraft event message.
   */
  private handleEvent(message: any): void {
    if (typeof message !== "object" && !message.header && !message.body) {
      console.warn(chalk.yellow("Received invalid event message: ", message));
      return;
    }
    this.emit(message.header.eventName, message);
  }

  /**
   * Subscribes to a list of Minecraft events.
   * @param events - An array of MinecraftEvent to subscribe to
   */
  public subscribeToEvents(events: MinecraftEvent[]): void {
    this._wss.on("connection", (ws) => {
      events.forEach((event) => {
        const subscribeRequest = {
          header: {
            version: 1,
            requestId: uuidv4(),
            messagePurpose: "subscribe",
            messageType: "commandRequest",
          },
          body: {
            eventName: event,
          },
        };

        this._wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(subscribeRequest));
            console.log(
              chalk.greenBright(`Sent subscription request for event: ${event}`)
            );
          }
        });
      });
    });
  }

  /**
   * Creates a command request object.
   * @param {string} command The command to send. e.g. `say Hello, world!`
   */
  private createCommandRequest(command: string): CommandRequest {
    return {
      header: {
        version: 1,
        requestId: uuidv4(),
        messagePurpose: "commandRequest",
        messageType: "commandRequest",
      },
      body: {
        version: 1,
        commandLine: command,
        origin: {
          type: "player",
        },
      },
    };
  }

  /**
   * Sends a command to the Minecraft server.
   * @param {string} command The command to send.
   */
  public sendCommand(command: string): void {
    const message = this.createCommandRequest(command);
    this.enqueueCommand(message);
  }

  /**
   * Sends a script event to the Minecraft server.
   * @param {string} eventId The ID of the event.
   * @param {string} message The message to send with the event.
   */
  public sendScriptEvent(eventId: string, message: string): void {
    this.sendCommand(`scriptevent ${eventId} ${message}`);
  }
}
