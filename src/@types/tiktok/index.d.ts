interface WebcastPushConnectionOptions {
  processInitialData?: boolean;
  fetchRoomInfoOnConnect?: boolean;
  enableExtendedGiftInfo?: boolean;
  enableWebsocketUpgrade?: boolean;
  enableRequestPolling?: boolean;
  requestPollingIntervalMs?: number;
  sessionId?: string;
  clientParams?: object;
  requestHeaders?: object;
  websocketHeaders?: object;
  requestOptions?: object;
  websocketOptions?: object;
}

interface TikTokLiveServerConfig {
  tiktokUsername: string;
  port?: string;
  options?: WebcastPushConnectionOptions;
}