import chalk from 'chalk';
import { WebcastPushConnection } from "tiktok-live-connector";
import { EventEmitter } from "events";
import { TikTokEventHandler } from "./TikTokEventHandler.js";
import { ConnectionManager } from "../../lib/ConnectionManager.js";

/**
 * TikTok Connection
 * @extends EventEmitter
 */
export class TikTokConnection extends EventEmitter {
    private static _instance: TikTokConnection;
    private _config: TikTokLiveServerConfig;
    private _connectionManager: ConnectionManager;
    private _tiktokConnection: WebcastPushConnection;
    private _tiktokEventHandler: TikTokEventHandler;
    
    private constructor(
        config: TikTokLiveServerConfig,
        connectionManager: ConnectionManager,
    ) {
        super();
        this.validateConfig(config);
        this._connectionManager = connectionManager;
        this.initialize();
    }

    /**
     * Getter for TikTok username.
     */
    public get username(): string {
        return this._config.tiktokUsername;
    }

    /**
     * Getter for TikTok port.
     */
    public get port(): string {
        return this._config.port;
    }
    
    /**
     * Ensures only one instance of TikTokConnection is created.
     * @param config - TikTok Live server configuration
     * @param connectionManager - Connection manager instance
     * @returns The instance of TikTokConnection
     */
    public static instance(config: TikTokLiveServerConfig, connectionManager: ConnectionManager): TikTokConnection {
        if (!TikTokConnection._instance) {
            TikTokConnection._instance = new TikTokConnection(config, connectionManager);
        }
        return TikTokConnection._instance;
    }

    /**
     * Retrieves the TikTok event handler.
     */
    public get events(): TikTokEventHandler {
        return this._tiktokEventHandler;
    }

    /**
     * Retrieves the TikTok WebcastPushConnection.
     */
    public get webcast(): WebcastPushConnection {
        return this._tiktokConnection;
    }

    /**
     * Initializes the TikTok connection.
     */
    private initialize(): void {
        this._tiktokConnection = new WebcastPushConnection(this._config.tiktokUsername, this._config.options); 
        this._tiktokEventHandler = new TikTokEventHandler(this._tiktokConnection, this._connectionManager); 

        // reconnect on disconnect
        this._tiktokConnection.on('disconnected', () => {
            this.initialize(); 
        });
    }

    /**
     * Validates the TikTok Live server configuration.
     * @param config - TikTok Live server configuration
     */
    private validateConfig(config: TikTokLiveServerConfig): void {
        if (!config.tiktokUsername) throw new Error(chalk.red('TikTok username is required.')); 
        this._config = config;
    }
}
