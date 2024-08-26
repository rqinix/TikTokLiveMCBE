import { connection } from "../core/MinecraftTikTokBridge.js";

const { tiktok, minecraft } = connection;

export function useTNTCoin() {
    minecraft.sendCommand('tellraw @a {"rawtext":[{"text":"§a§lTNTCoin extension loaded!"}]}');

    tiktok.events.onJoin((data) => {
        const message = JSON.stringify({
            uniqueId: data.uniqueId,
            nickname: data.nickname,
        });
        minecraft.sendScriptEvent('tntcoin:join', message);
    });

    tiktok.events.onFollow((data) => {
        const message = JSON.stringify({
            uniqueId: data.uniqueId,
            nickname: data.nickname,
        });
        minecraft.sendScriptEvent('tntcoin:follow', message);
    });

    tiktok.events.onChat((data) => {
        const message = JSON.stringify({
            uniqueId: data.uniqueId,
            nickname: data.nickname,
            comment: data.comment
        });
        minecraft.sendScriptEvent('tntcoin:chat', message);
    });

    tiktok.events.onLike((data) => {
        const message = JSON.stringify({
            uniqueId: data.uniqueId,
            nickname: data.nickname,
            count: data.likeCount,
            totalLikes: data.totalLikeCount
        });
        minecraft.sendScriptEvent('tntcoin:like', message);
    });

    tiktok.events.onGift((data) => {
        if (data.giftType !== 1 || data.repeatEnd) return;

        const message = JSON.stringify({
            giftName: data.giftName,
            giftCount: data.repeatCount,
            gifterUniqueId: data.uniqueId,
            gifterNickName: data.nickname,
            gifterRank: data.topGifterRank
        });
        minecraft.sendScriptEvent('tntcoin:gift', message);
    });

    tiktok.events.onShare((data) => {
        const message = JSON.stringify({
            uniqueId: data.uniqueId,
            nickname: data.nickname,
        });
        minecraft.sendScriptEvent('tntcoin:share', message);
    });

    tiktok.events.onStreamEnd(() => {
        connection.shutdown();
    });
}
