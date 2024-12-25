import { WebcastPushConnection } from "tiktok-live-connector";
import { ConnectionManager } from "../lib/connection-manager.js";
import chalk from "chalk";

type TikTokEvents =
  | TikTokLikeEvent
  | TikTokChatEvent
  | TikTokFollowEvent
  | TikTokGiftEvent
  | TikTokJoinEvent
  | TikTokShareEvent;

export class TikTokEventHandler {
  private readonly _tiktokLive: WebcastPushConnection;
  private readonly _connectionManager: ConnectionManager;

  /**
   * Creates a new TikTok event handler.
   * @param tiktokConnection - The TikTok WebcastPushConnection instance.
   * @param connectionManager - The connection manager instance.
   */
  constructor(
    tiktokConnection: WebcastPushConnection,
    connectionManager: ConnectionManager
  ) {
    this._tiktokLive = tiktokConnection;
    this._connectionManager = connectionManager;
  }

  /**
   * Registers an event handler for the specified event.
   * @param eventName - The name of the event to handle.
   * @param handler - The event handler function.
   * @returns The WebcastPushConnection instance.
   */
  public onEvent(
    eventName: CustomEvents | MessageEvents | ControlEvents,
    handler: (...data: TikTokEvents[]) => void
  ): WebcastPushConnection {
    return this._tiktokLive.on(eventName, (data) => {
      try {
        this._connectionManager
          .getConnections()
          .forEach((socket) => handler(data));
      } catch (error) {
        console.error(chalk.red(`Error handling ${eventName} event: ${error}`));
      }
    });
  }

  // Custom Events

  public onFollow(
    handler: (data: TikTokFollowEvent) => void
  ): WebcastPushConnection {
    return this.onEvent("follow", handler);
  }

  public onShare(
    handler: (data: TikTokShareEvent) => void
  ): WebcastPushConnection {
    return this.onEvent("share", handler);
  }

  // Message Events

  public onLike(
    handler: (data: TikTokLikeEvent) => void
  ): WebcastPushConnection {
    return this.onEvent("like", handler);
  }

  public onGift(
    handler: (data: TikTokGiftEvent) => void
  ): WebcastPushConnection {
    return this.onEvent("gift", handler);
  }

  public onChat(
    handler: (data: TikTokChatEvent) => void
  ): WebcastPushConnection {
    return this.onEvent("chat", handler);
  }

  public onJoin(
    handler: (data: TikTokJoinEvent) => void
  ): WebcastPushConnection {
    return this.onEvent("member", handler);
  }

  // Control Events

  public onStreamEnd(handler: (data: any) => void) {
    return this.onEvent("streamEnd", handler);
  }
}
