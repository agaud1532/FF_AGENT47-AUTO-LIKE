import express from "express";
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

import helpCommand from "../commands/help.js";
import startCommand from "../commands/start.js";
import likeCommand from "../commands/like.js";
import getCommand from "../commands/get.js";

dotenv.config();

const app = express();

app.use(express.json());

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error("BOT_TOKEN is missing");
}

const bot = new TelegramBot(token, {
  polling: false,
});

// Commands
startCommand(bot);
helpCommand(bot);
likeCommand(bot);
getCommand(bot);

// Normal messages
bot.on("message", async (msg) => {
  if (!msg.text) return;

  if (msg.text.startsWith("/")) return;

  try {
    await bot.sendMessage(
      msg.chat.id,
      `Hello ${msg.from?.first_name || "User"}`
    );
  } catch (error) {
    console.error("Message Error:", error);
  }
});

// Telegram webhook
app.post("/telegram", async (req, res) => {
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
      error: "Webhook error",
    });
  }
});

// Test
app.get("/", (req, res) => {
  res.status(200).json({
    status: "Telegram webhook is working",
  });
});

export default app;