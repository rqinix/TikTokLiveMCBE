import { createSpinner } from 'nanospinner';
import chalk from 'chalk';
import { WebSocketServer } from 'ws';
import { Server, createServer } from 'node:http';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ConnectionManager } from '../lib/ConnectionManager.js';
import MinecraftConnection from '../models/minecraft/MinecraftConnection.js';
import { TikTokConnection } from '../models/tiktok/TikTokConnection.js';
import { CONFIG } from '../config/config.js';
import gradient from 'gradient-string';

export class MinecraftTikTokBridge {
    public static _instance: MinecraftTikTokBridge;

    private _app: express.Express;
    private _server: Server;

    private _wss: WebSocketServer;
    private _PORT: number;

    private _connectionManager: ConnectionManager;
    private _config: TikTokLiveServerConfig;
    private _minecraftConnection: MinecraftConnection;
    private _tiktokConnection: TikTokConnection;

    /**
     * Initializes the bridge with the provided configuration.
     * @param config - TikTok Live server configuration
     */
    private constructor(config: TikTokLiveServerConfig) {
        this._config = config;
        this.initialize();
    }

    /**
     * Ensures only one instance of MinecraftTikTokBridge is created.
     * @param config - TikTok Live server configuration
     * @returns The instance of MinecraftTikTokBridge
     */
    public static instance(config: TikTokLiveServerConfig): MinecraftTikTokBridge {
        if (!MinecraftTikTokBridge._instance) {
            MinecraftTikTokBridge._instance = new MinecraftTikTokBridge(config);
        }
        return MinecraftTikTokBridge._instance;
    }

    /**
     * Initializes the Express app, WebSocket server, and connections.
     */
    private initialize(): void {
        this._app = express();
        this._server = createServer(this._app);
        this._wss = new WebSocketServer({ server: this._server });
        this._PORT = parseInt(this._config.port);
        this._connectionManager = new ConnectionManager();
        this._tiktokConnection = TikTokConnection.instance(this._config, this._connectionManager);
        this._minecraftConnection = MinecraftConnection.instance(this._wss, this._connectionManager);
        this.setup().then(this.startPing.bind(this));
    }

    /**
     * Sets up the server and connects to TikTok Live.
     * Handles WebSocket connections and errors.
     */
    private async setup(): Promise<void> {
        try {
            await this.startServer();
            await this.connectToTikTok();
        } catch (error) {
            console.error(chalk.red("Error during setup: "), error);
            process.exit(1);
        }

        this._wss.on("connection", (client) => {
            const id = uuidv4();
            this._connectionManager.addConnection(id, client);
            client.on("close", () => this._connectionManager.removeConnection(id));
            client.on("error", this.handleSocketError.bind(this, id));
            client.on("pong", () => console.log("Pong received."));
        });
    }

    /**
     * Starts the Express server and listens on the configured port.
     * @returns Promise<void>
     */
    private startServer(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._server.listen(this._PORT, () => {
                console.log(chalk.bgGray(chalk.bold((gradient.atlas('!!!WELCOME TO TikTokLiveMCBE!!!')))))
                console.log(chalk.greenBright(`Server is running on port ${this._PORT}`));
                resolve();
            }).on('error', (error: NodeJS.ErrnoException) => {
                if (error.code === 'EADDRINUSE') {
                    console.error(chalk.red(`Port ${this._PORT} is already in use.`));
                    process.exit(1);
                } else {
                    reject(error);
                }
            });
        });
    }

    /**
     * Connects to the TikTok Live stream using the provided configuration.
     * @returns Promise<void>
     */
    private async connectToTikTok(): Promise<void> {
        const username = chalk.cyanBright.bold(this._config.tiktokUsername);

        const spinner = createSpinner(`Connecting to ${username} TikTok Live Stream...`, {
            "frames": ["[|]", "[/]", "[-]", "[\\]"],
            "interval": 50,
            "color": "yellow"
        }).start({
            "color": "yellow",
            "text": `Connecting to ${username} TikTok Live Stream...`
        });
    
        try {
            await this._tiktokConnection.webcast.connect();
            spinner.success({ 
                text: chalk.greenBright(`Connected to ${username} TikTok Live Stream.\nOpen Minecraft and run this command '${chalk.underline("/connect localhost:" + this._PORT)}' to connect.`),
            });
        } catch (error) {
            spinner.error({
                "text": chalk.redBright(`Failed to connect to ${username} TikTok Live Stream.`),
            });
            console.error(chalk.red(error.message));
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
                    return;
                }
                this._wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) client.ping();
                });
            }, 30 * 1000); // 30 seconds
        } catch (error) {
            console.error(chalk.red("Error starting ping:"), error);
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
            console.log(chalk.red("WebSocket connection closed by client."));
        } else {
            this._connectionManager.removeConnection(id);
            console.error("WebSocket error: ", error.message);
        }
    }
    
    /**
     * Shuts down the server and closes all connections.
     * @param exit - Whether to exit the process after shutdown.
     * @returns Promise<void>
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
                    console.error("Error closing server:", err);
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

export const connection = MinecraftTikTokBridge.instance(CONFIG);
