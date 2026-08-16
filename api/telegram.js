import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const token = process.env.BOT_TOKEN;

if (!token) {
  throw new Error("BOT_TOKEN is missing");
}

const bot = new TelegramBot(token, {
  polling: false,
});

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      status: "Telegram webhook is working",
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const update = req.body;

    console.log("TELEGRAM UPDATE:", JSON.stringify(update));

    const message = update?.message;

    if (!message) {
      return res.status(200).json({
        success: true,
      });
    }

    const chatId = message.chat?.id;
    const text = message.text;
    const firstName = message.from?.first_name || "User";

    console.log("CHAT ID:", chatId);
    console.log("TEXT:", text);

    if (!chatId || !text) {
      return res.status(200).json({
        success: true,
      });
    }

    // =========================
    // START
    // =========================

    if (/^\/start(?:@\w+)?$/i.test(text)) {
      console.log("START RECEIVED");

      await bot.sendMessage(
        chatId,
        `👋 <b>Welcome ${firstName}!</b>

🔥 <b>AUTOLIKE GROUP</b> 🔥

💯 Real & Instant Likes Guaranteed
⚡ Grow Faster Than Others
👑 Join Now & Stand Out`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "📢 JOIN GROUP",
                  url: "https://t.me/freefiregloryORlikesbot",
                },
              ],
              [
                {
                  text: "📢 AGENT47",
                  url: "https://t.me/FF_AGENT47",
                },
              ],
            ],
          },
        }
      );

      console.log("START SENT");

      return res.status(200).json({
        success: true,
      });
    }

    // =========================
    // HELP
    // =========================

    if (/^\/help(?:@\w+)?$/i.test(text)) {
      console.log("HELP RECEIVED");

      await bot.sendMessage(
        chatId,
        `📚 <b>Available Commands</b>

▶️ /start
❓ /help
❤️ /like ind &lt;UID&gt;
🔎 /get &lt;UID&gt;`,
        {
          parse_mode: "HTML",
        }
      );

      console.log("HELP SENT");

      return res.status(200).json({
        success: true,
      });
    }

    // =========================
    // NORMAL MESSAGE
    // =========================

    if (!text.startsWith("/")) {
      await bot.sendMessage(
        chatId,
        `Hello ${firstName}`
      );

      console.log("NORMAL MESSAGE SENT");

      return res.status(200).json({
        success: true,
      });
    }

    // =========================
    // UNKNOWN COMMAND
    // =========================

    await bot.sendMessage(
      chatId,
      "❌ Unknown command.\n\nUse /help to see available commands."
    );

    return res.status(200).json({
      success: true,
    });

  } catch (error) {
    console.error(
      "TELEGRAM ERROR:",
      error.response?.body || error.message
    );

    return res.status(200).json({
      success: false,
      error: error.response?.body || error.message,
    });
  }
}