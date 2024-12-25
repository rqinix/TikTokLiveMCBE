import chalk from "chalk";
import gradient from "gradient-string";
import express from "express";
import { v4 as uuidv4 } from "uuid";
import { WebSocketServer } from "ws";
import { createSpinner } from "nanospinner";
import { Server, createServer } from "node:http";
import { ConnectionManager } from "../lib/connection-manager.js";
import MinecraftConnection from "../connections/minecraft-connection.js";
import { TikTokConnection } from "../connections/tiktok-connection.js";
import { loadPlugins } from "./load-plugins.js";

export class TikTokLiveMcbe {
  public static _instance: TikTokLiveMcbe;
  private _app: express.Express;
  private _server: Server;
  private _wss: WebSocketServer;
  private _config: TikTokLiveServerConfig;
  private _connectionManager: ConnectionManager;
  private _minecraftConnection: MinecraftConnection;
  private _tiktokConnection: TikTokConnection;

  /**
   * Initializes the bridge with the provided configuration.
   * @param config - TikTok Live server configuration
   */
  private constructor(config: TikTokLiveServerConfig) {
    this._config = config;
  }

  /**
   * Ensures only one instance of TikTokLiveMCBE is created.
   * @param config - TikTok Live server configuration
   * @returns The instance of TikTokLiveMCBE
   */
  public static instance(config: TikTokLiveServerConfig): TikTokLiveMcbe {
    if (!TikTokLiveMcbe._instance) {
      TikTokLiveMcbe._instance = new TikTokLiveMcbe(config);
    }
    return TikTokLiveMcbe._instance;
  }

  /**
   * Initializes the Express app, WebSocket server, and connections.
   */
  public async initialize(): Promise<void> {
    this._app = express();
    this._server = createServer(this._app);
    this._wss = new WebSocketServer({ server: this._server });
    this._connectionManager = new ConnectionManager();
    this._tiktokConnection = TikTokConnection.instance(
      this._config,
      this._connectionManager
    );
    this._minecraftConnection = MinecraftConnection.instance(
      this._wss,
      this._connectionManager
    );
    await this.setup();
  }

  /**
   * Sets up the server and connects to TikTok Live.
   * Handles WebSocket connections and errors.
   */
  private async setup(): Promise<void> {
    try {
      await this.startServer();
      await loadPlugins(this);
      await this.connectToTikTok();
    } catch (error) {
      console.error(chalk.red("Error during setup: "), error.message);
      process.exit(1);
    }

    this._wss.on("connection", (client) => {
      const id = uuidv4();
      this._connectionManager.addConnection(id, client);
      this.startPing();
      client.on("close", () => this._connectionManager.removeConnection(id));
      client.on("error", this.handleSocketError.bind(this, id));
      client.on("pong", () =>
        console.log(
          gradient(["#7F00FF", "#FF00FF"])("Keeping the Nether Portal open...")
        )
      );
    });
  }

  /**
   * Starts the Express server and listens on the configured port.
   * @returns the
   */
  private startServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._server
        .listen(this._config.port, resolve)
        .on("error", (error: NodeJS.ErrnoException) => {
          if (error.code === "EADDRINUSE") {
            console.error(
              chalk.yellowBright(
                `Port ${this._config.port} is already in use. `
              )
            );
            process.exit(1);
          } else {
            reject(error);
          }
        });
    });
  }

  /**
   * Connects to the TikTok Live stream using the provided configuration.
   * @returns A promise that resolves when the connection is established.
   */
  private async connectToTikTok(): Promise<void> {
    const username = chalk.cyanBright.bold(this._config.tiktokUsername);
    const spinner = createSpinner(
      `Connecting to ${username} TikTok Live Stream...`,
      {
        frames: ["[-]", "[\\]", "[|]", "[/]"],
        interval: 50,
        color: "yellow",
      }
    ).start({
      color: "yellow",
      text: `Connecting to ${username} TikTok Live Stream...`,
    });

    this._tiktokConnection.events.onStreamEnd(() => {
      spinner.update({
        text: chalk.redBright(`The TikTok Live Stream has ended.`),
      });
      this.shutdown();
    });

    try {
      await this._tiktokConnection.webcast.connect();
      spinner.success({
        text: chalk.greenBright(
          `Connected to ${username} TikTok Live Stream.\nOpen Minecraft and run this command '${chalk.underline(
            "/connect localhost:" + this._config.port
          )}' to connect.`
        ),
      });
      console.info(
        chalk.yellow(chalk.underline("<Ctrl + C>"), "to stop the server.")
      );
    } catch (error) {
      spinner.error({
        text: chalk.redBright(
          `Failed to connect to ${username} TikTok Live Stream.`
        ),
      });
      process.exit(1);
    }
  }

  /**
   * Getter for TikTok connection instance.
   * @returns TikTokConnection instance
   */
  public get tiktok(): TikTokConnection {
    return this._tiktokConnection;
  }

  /**
   * Getter for Minecraft connection instance.
   * @returns MinecraftConnection instance
   */
  public get minecraft(): MinecraftConnection {
    return this._minecraftConnection;
  }

  /**
   * Starts the ping interval to keep WebSocket connections alive.
   */
  private startPing(): void {
    try {
      if (this._wss.clients.size === 0) return;
      const pingInterval = setInterval(() => {
        if (this._wss.clients.size === 0) {
          clearInterval(pingInterval);
          console.log("No players connected.");
          return;
        }

        this._wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) client.ping();
        });
      }, 60 * 1000); // 1 minute
    } catch (error) {
      console.error(
        chalk.red("Error opening the Nether Portal:"),
        error.message
      );
    }
  }

  /**
   * Handles WebSocket errors
   * @param id - The unique identifier for the connection.
   * @param error - The error that occurred.
   */
  private handleSocketError(id: string, error: Error): void {
    if (
      error instanceof RangeError &&
      error.message.includes("Invalid WebSocket frame: invalid status code 0")
    ) {
      console.log(chalk.red("WebSocket connection closed by player."));
    } else {
      this._connectionManager.removeConnection(id);
      console.error("WebSocket error: ", error.message);
    }
  }

  /**
   * Shuts down the server and closes all connections.
   * @param exit - Whether to exit the process after shutdown.
   * @returns A promise that resolves when the server is shut down.
   */
  public async shutdown(exit: boolean = true): Promise<void> {
    this._tiktokConnection.webcast.disconnect();

    this._wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.close();
    });

    this._connectionManager.closeAllConnections();

    return new Promise((resolve, reject) => {
      this._server.close((err) => {
        if (err) {
          console.error("Error closing server:", err.message);
          if (exit) process.exit(1);
          reject(err);
        } else {
          console.log(chalk.grey("Server shutdown."));
          if (exit) process.exit(0);
          resolve();
        }
      });
    });
  }
}

/**
 * Connects to the TikTok Live server using the provided configuration.
 * @param config - TikTok Live server configuration
 * @returns The TikTokLiveMCBE instance
 */
export async function connect(
  config: TikTokLiveServerConfig
): Promise<TikTokLiveMcbe> {
  const tiktokLiveMcbe = TikTokLiveMcbe.instance(config);
  await tiktokLiveMcbe.initialize();
  return tiktokLiveMcbe;
}
