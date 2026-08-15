import TelegramBot from "node-telegram-bot-api";

import helpCommand from "../commands/help.js";
import startCommand from "../commands/start.js";
import likeCommand from "../commands/like.js";
import getCommand from "../commands/get.js";

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token);

bot.on("message", (msg) => {
  if (!msg.text || msg.text.startsWith("/")) return;

  bot.sendMessage(
    msg.chat.id,
    `Hello ${msg.from?.first_name || "User"}`
  );
});

startCommand(bot);
helpCommand(bot);
likeCommand(bot);
getCommand(bot);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("Telegram bot is running");
  }

  try {
    await bot.processUpdate(req.body);

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Telegram webhook error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}