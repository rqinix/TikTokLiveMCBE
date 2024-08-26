import 'dotenv/config';

export const CONFIG: TikTokLiveServerConfig = {
    tiktokUsername: process.env.TIKTOK_USERNAME,
    port: process.env.PORT,
    // options: {
    //     sessionId: process.env.TIKTOK_SESSION_ID,
    // }
}