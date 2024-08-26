type UUID = string;

interface BaseMessage<T = any> {
  header: MessageHeader;
  body: T;
}

interface MessageHeader {
  version: number;
  requestId: UUID;
  messagePurpose: string;
  messageType: string;
}

interface Message extends BaseMessage {}

interface SubscribeRequestMessage {
  header: MessageHeader;
  body: SubscribeRequestBody;
}

interface SubscribeRequestBody {
  eventName: string;
}

interface CommandResponseMessage {
  header: MessageHeader;
  body: CommandResponseBody;
}

interface CommandResponseBody {
  statusCode: number;
  statusMessage: string;
}

interface ErrorResponseMessage {
  header: MessageHeader;
  body: ErrorResponseBody;
}

interface ErrorResponseBody {
  statusCode: number;
  statusMessage: string;
}

interface CommandRequest {
  header: MessageHeader;
  body: CommandRequestBody;
}

interface CommandRequestBody {
  version: number;
  commandLine: string;
  origin: {
    type: string;
  };
}