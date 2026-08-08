import TelegramBot from "node-telegram-bot-api";
import helpCommand from "./commands/help.js";
import startCommand from "./commands/start.js";
import likeCommand from "./commands/like.js"
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("details");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, {
  polling: true,
});

bot.on("polling_error", (error) => {
  console.error("Polling Error:");
  console.error(error);
});

bot.on("message", (msg) => {
  if (msg.text.startsWith("/")) return;

  bot.sendMessage(msg.chat.id, `Hello ${msg.from.first_name}`);
});

startCommand(bot);
helpCommand(bot);
likeCommand(bot)