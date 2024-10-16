import chalk from "chalk";
import gradient from "gradient-string";
import { connection } from "../core/MinecraftTikTokBridge.js";
import { TEXT_TIKTOK_LIVE_MCBE } from "../text/index.js";

const { tiktok, minecraft } = connection;
const tntcoinLinkText = 'Download TNT COIN ADDON';
const tntcoinLink = `\u001b]8;;https://github.com/rqinix/TNTCoin\u001b\\${chalk.underline(gradient.rainbow(tntcoinLinkText))}\u001b]8;;\u001b\\`;
const tntCoinGradient = gradient(['#FF0000', '#FFFF00']);
const extensionGradient = gradient(['#FFA500', '#FF4500']);
const myYoutubeLink = '\u001b]8;;https://www.youtube.com/c/rqinix\u001b\\YouTube: rqinix\u001b]8;;\u001b\\';
const myTikTokLink = '\u001b]8;;https://www.tiktok.com/@rqinix\u001b\\TikTok: rqinix\u001b]8;;\u001b\\';
const myYoutube = chalk.redBright.underline(myYoutubeLink);
const myTikTok = chalk.magenta.underline(myTikTokLink);

export function useTNTCoin() {
    const newFollowers: string[] = [];

    minecraft.on('connected', () => {
        const data = { tiktokUserName: tiktok.username, }
        const textTNTCoin = `§cTNT§f §eCoin§f`;
        minecraft.sendCommand(`tellraw @a {"rawtext":[{"text":"${TEXT_TIKTOK_LIVE_MCBE}: §a§l${textTNTCoin} §aextension loaded!"}]}`);
        minecraft.sendCommand(`scriptevent tntcoin:connected ${JSON.stringify(data)}`);
    });

    tiktok.webcast.on('connected', () => {
        tiktok.webcast.getAvailableGifts().then((gifts) => {
            console.log(gradient.mind('='.repeat(process.stdout.columns || 80)));
            console.table(
                gifts
                  .map(gift => ({ ID: gift.id, Name: gift.name, 'Diamond Count': gift.diamond_count }))
                  .sort((a, b) => a['Diamond Count'] - b['Diamond Count'])
              );
            console.info(`Above are the available gifts for ${chalk.cyanBright(tiktok.username)}.\n`);
            console.info(`You are using the ${tntCoinGradient('TNT Coin')} ${extensionGradient('extension')} for ${tntCoinGradient('TNT Coin')} ${extensionGradient('Addon')}.`);
            console.info(`- ${tntcoinLink}`);
            console.info(`${myYoutube}`);
            console.info(`${myTikTok}`);
            console.info(`\nRun Minecraft command: ${chalk.greenBright(`'/connect localhost:${tiktok.port}'`)} to connect.`);
            console.log(gradient.mind('='.repeat(process.stdout.columns || 80)));
        });
    });

    tiktok.events.onJoin((data) => {
        const message = JSON.stringify({
            uniqueId: data.uniqueId,
            nickname: data.nickname,
        });
        minecraft.sendScriptEvent('tntcoin:join', message);
    });

    tiktok.events.onFollow((data) => {
        if (!newFollowers.includes(data.uniqueId)) {
            newFollowers.push(data.uniqueId);
            const message = JSON.stringify({
                uniqueId: data.uniqueId,
                nickname: data.nickname,
            });
            minecraft.sendScriptEvent('tntcoin:follow', message);
        }
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
        const message = JSON.stringify({
            uniqueId: data.uniqueId,
            nickname: data.nickname,
            giftName: data.giftName,
            giftId: data.giftId,
            giftCount: data.repeatCount,
        });

        if (data.repeatEnd) {
            minecraft.sendScriptEvent('tntcoin:gift', message);
        } else {
            if (data.giftName === 'Heart Me') minecraft.sendScriptEvent('tntcoin:gift', message);
        }
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
