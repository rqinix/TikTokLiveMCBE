import { connection } from "./core/MinecraftTikTokBridge.js";
import { useTNTCoin } from "./extensions/tntcoin.js";

const { tiktok, minecraft } = connection;

useTNTCoin();
