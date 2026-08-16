import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

import helpCommand from "../commands/help.js";
import startCommand from "../commands/start.js";
import likeCommand from "../commands/like.js";
import getCommand from "../commands/get.js";

dotenv.config();

const token = process.env.BOT_TOKEN;

if (!token) {
  throw new Error("BOT_TOKEN is missing");
}

const bot = new TelegramBot(token, {
  polling: false,
});

startCommand(bot);
helpCommand(bot);
likeCommand(bot);
getCommand(bot);

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

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      status: "Telegram webhook is working",
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    console.log("Telegram update received:", req.body);

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