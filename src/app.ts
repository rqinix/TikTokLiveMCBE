import chalk from "chalk";
import gradient from "gradient-string";
import { CONFIG } from "./config/config.js";
import { connect } from "./core/tiktok-live-mcbe.js";
import { getUserInput } from "./utils/prompts.js";

export async function main() {
  console.log(
    gradient(["#7F00FF", "#3ff431"]).multiline("Welcome to TikTokLiveMCBE!")
  );

  try {
    const config = await getUserInput();
    CONFIG.tiktokUsername = config.TIKTOK_USERNAME;
    CONFIG.port = config.PORT;
  } catch (error) {
    console.error(
      chalk.red("Failed to get TikTok username and port:", error.message)
    );
  }

  try {
    await connect(CONFIG);
  } catch (error) {
    console.error(chalk.red("Failed to connect to TikTok:", error.message));
  }
};

main();
