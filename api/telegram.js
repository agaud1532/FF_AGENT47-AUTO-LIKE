import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: false,
});

export default async function handler(req, res) {
  console.log("METHOD:", req.method);
  console.log("URL:", req.url);
  console.log("BODY:", req.body);

  if (req.method === "GET") {
    return res.status(200).json({
      status: "GET working",
    });
  }

  if (req.method === "POST") {
    return res.status(200).json({
      status: "POST working",
    });
  }

  return res.status(405).json({
    error: "Method not allowed",
  });
}