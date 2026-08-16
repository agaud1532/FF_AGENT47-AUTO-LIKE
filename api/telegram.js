import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

import startCommand from "../commands/start.js";
import helpCommand from "../commands/help.js";
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

// ===============================
// COMMANDS
// ===============================

startCommand(bot);
helpCommand(bot);
likeCommand(bot);
getCommand(bot);

// ===============================
// NORMAL MESSAGE
// ===============================

bot.on("message", async (msg) => {
  if (!msg.text || msg.text.startsWith("/")) {
    return;
  }

  try {
    await bot.sendMessage(
      msg.chat.id,
      `Hello ${msg.from?.first_name || "User"}`
    );

    console.log("NORMAL MESSAGE SENT");
  } catch (error) {
    console.error(
      "MESSAGE ERROR:",
      error.response?.body || error.message
    );
  }
});

// ===============================
// VERCEL WEBHOOK
// ===============================

export default async function handler(req, res) {
  // GET TEST
  if (req.method === "GET") {
    return res.status(200).json({
      status: "Telegram webhook is working",
    });
  }

  // ONLY POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    console.log("=================================");
    console.log("Telegram update received:", req.body);
    console.log("=================================");

    // Telegram update ko bot ke event handlers ke paas bhejo
    await bot.processUpdate(req.body);

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("=================================");
    console.error(
      "WEBHOOK ERROR:",
      error.response?.body || error.message
    );
    console.error("=================================");

    // Telegram ko 200 dena better hai,
    // warna same update baar-baar aa sakta hai.
    return res.status(200).json({
      success: false,
      error: error.response?.body || error.message,
    });
  }
}