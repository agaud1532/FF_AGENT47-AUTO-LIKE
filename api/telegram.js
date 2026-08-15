import TelegramBot from "node-telegram-bot-api";

import helpCommand from "../commands/help.js";
import startCommand from "../commands/start.js";
import likeCommand from "../commands/like.js";
import getCommand from "../commands/get.js";

const token = process.env.BOT_TOKEN;

if (!token) {
  throw new Error("BOT_TOKEN is missing");
}

const bot = new TelegramBot(token);

// Commands
startCommand(bot);
helpCommand(bot);
likeCommand(bot);
getCommand(bot);

// Normal messages
bot.on("message", async (msg) => {
  if (!msg.text || msg.text.startsWith("/")) return;

  try {
    await bot.sendMessage(
      msg.chat.id,
      `Hello ${msg.from?.first_name || "User"}`
    );
  } catch (error) {
    console.error("Message Error:", error);
  }
});

// Vercel serverless function
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
    console.error("Webhook Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}