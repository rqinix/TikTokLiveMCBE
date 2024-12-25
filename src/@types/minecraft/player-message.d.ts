
interface PlayerMessage {
  header: PlayerMessageHeader;
  body: PlayerMessageBody;
}

interface PlayerMessageBody {
  message: string;
  receiver: string;
  sender: string;
  type: string;
}

interface PlayerMessageHeader {
  eventName: string;
  messagePurpose: string;
  version: number;
}