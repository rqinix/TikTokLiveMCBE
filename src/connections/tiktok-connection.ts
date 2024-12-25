import chalk from "chalk";
import { WebcastPushConnection } from "tiktok-live-connector";
import { EventEmitter } from "events";
import { TikTokEventHandler } from "./tiktok-event-handler.js";
import { ConnectionManager } from "../lib/connection-manager.js";

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

  /**
   * Initializes the TikTok connection.
   * @param config - TikTok Live server configuration
   * @param connectionManager - Connection manager instance
   */
  private constructor(
    config: TikTokLiveServerConfig,
    connectionManager: ConnectionManager
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
  public static instance(
    config: TikTokLiveServerConfig,
    connectionManager: ConnectionManager
  ): TikTokConnection {
    if (!TikTokConnection._instance) {
      TikTokConnection._instance = new TikTokConnection(
        config,
        connectionManager
      );
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
    this._tiktokConnection = new WebcastPushConnection(
      this._config.tiktokUsername,
      this._config.options
    );
    this._tiktokEventHandler = new TikTokEventHandler(
      this._tiktokConnection,
      this._connectionManager
    );
  }

  /**
   * Validates the TikTok Live server configuration.
   * @param config - TikTok Live server configuration
   */
  private validateConfig(config: TikTokLiveServerConfig): void {
    if (!config.tiktokUsername) {
      console.warn(chalk.red("TikTok username is required."));
      process.exit(1);
    }
    this._config = config;
  }
}
