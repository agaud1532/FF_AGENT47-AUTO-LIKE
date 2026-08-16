import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

import helpCommand from "../commands/help.js";
import startCommand from "../commands/start.js";
import likeCommand from "../commands/like.js";
import getCommand from "../commands/get.js";

dotenv.config();

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, {
  polling: false,
});

startCommand(bot);
helpCommand(bot);
likeCommand(bot);
getCommand(bot);

export default async function handler(req, res) {
  console.log("REQUEST:", req.method, req.url);

  if (req.method === "GET") {
    return res.status(200).json({
      status: "working",
    });
  }

  if (req.method === "POST") {
    try {
      console.log("TELEGRAM UPDATE:", req.body);

      await bot.processUpdate(req.body);

      return res.status(200).json({
        success: true,
      });
    } catch (error) {
      console.error("ERROR:", error);

      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  return res.status(405).json({
    error: "Method not allowed",
  });
}