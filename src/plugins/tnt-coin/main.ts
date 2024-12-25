import { TikTokLiveMcbe } from "../../core/tiktok-live-mcbe.js";

/**
 * TikTokLiveMCBE plugin.
 * A plugin to support the TNT Coin addon.
 * @param tiktokLiveMcbe The TikTokLiveMCBE instance.
 */
export function plugin(tiktokLiveMcbe: TikTokLiveMcbe): void {
  const { tiktok, minecraft } = tiktokLiveMcbe;
  const newFollowers: string[] = [];

  minecraft.on("connected", () => {
    const data = { tiktokUserName: tiktok.username };
    minecraft.sendCommand(
      `tellraw @a {"rawtext":[{"text":"§a§l§cTNT§f §eCoin§f §aplugin loaded§f!"}]}`
    );
    minecraft.sendCommand(
      `scriptevent tntcoin:connected ${JSON.stringify(data)}`
    );
  });

  tiktok.events.onJoin((data) => {
    const message = JSON.stringify({
      uniqueId: data.uniqueId,
      nickname: data.nickname,
    });
    minecraft.sendScriptEvent("tntcoin:join", message);
  });

  tiktok.events.onFollow((data) => {
    if (newFollowers.includes(data.uniqueId)) return;
    newFollowers.push(data.uniqueId);
    const message = JSON.stringify({
      uniqueId: data.uniqueId,
      nickname: data.nickname,
    });
    minecraft.sendScriptEvent("tntcoin:follow", message);
  });

  tiktok.events.onChat((data) => {
    const message = JSON.stringify({
      uniqueId: data.uniqueId,
      nickname: data.nickname,
      comment: data.comment,
    });
    minecraft.sendScriptEvent("tntcoin:chat", message);
  });

  tiktok.events.onLike((data) => {
    const message = JSON.stringify({
      uniqueId: data.uniqueId,
      nickname: data.nickname,
      count: data.likeCount,
      totalLikes: data.totalLikeCount,
    });
    minecraft.sendScriptEvent("tntcoin:like", message);
  });

  tiktok.events.onGift((data) => {
    const { giftType, repeatCount, repeatEnd, uniqueId, nickname, giftName, giftId } = data;
    if (giftType === 1 && !repeatEnd) return;
    const message = JSON.stringify({
      uniqueId,
      nickname,
      giftName,
      giftId,
      giftCount: repeatCount,
      giftType,
    });
    minecraft.sendScriptEvent("tntcoin:gift", message);
  });

  tiktok.events.onShare((data) => {
    const message = JSON.stringify({
      uniqueId: data.uniqueId,
      nickname: data.nickname,
    });
    minecraft.sendScriptEvent("tntcoin:share", message);
  });
}
