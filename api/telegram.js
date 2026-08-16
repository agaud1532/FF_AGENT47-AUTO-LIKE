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
  // =========================
  // GET - Test webhook
  // =========================
  if (req.method === "GET") {
    return res.status(200).json({
      status: "Telegram webhook is working",
    });
  }

  // =========================
  // Only POST allowed
  // =========================
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const update = req.body;

    console.log("=================================");
    console.log("Telegram update received:", update);
    console.log("=================================");

    // Telegram update me message nahi hai
    if (!update?.message) {
      console.log("No message found");

      return res.status(200).json({
        success: true,
      });
    }

    const message = update.message;

    const chatId = message.chat?.id;
    const text = message.text;
    const firstName = message.from?.first_name || "User";

    if (!chatId) {
      console.log("Chat ID missing");

      return res.status(200).json({
        success: true,
      });
    }

    if (!text) {
      console.log("Text missing");

      return res.status(200).json({
        success: true,
      });
    }

    console.log("CHAT ID:", chatId);
    console.log("TEXT:", text);

    // =====================================
    // /start
    // =====================================
    if (/^\/start(?:@\w+)?$/i.test(text)) {
      console.log("START COMMAND RECEIVED");

      await bot.sendMessage(
        chatId,
        `👋 <b>Welcome ${firstName}!</b>

╔═══━━━✦❘༻༺❘✦━━━═══╗
      🔥 <b>𝐀𝐔𝐓𝐎𝐋𝐈𝐊𝐄 𝐆𝐑𝐎𝐔𝐏</b> 🔥
╚═══━━━✦❘༻༺❘✦━━━═══╝

💯 <b>𝑹𝒆𝒂𝒍 & 𝑰𝒏𝒔𝒕𝒂𝒏𝒕 𝑳𝒊𝒌𝒆𝒔 𝑮𝒖𝒂𝒓𝒂𝒏𝒕𝒆𝒆𝒅</b>
⚡ <b>𝑮𝒓𝒐𝒘 𝑭𝒂𝒔𝒕𝒆𝒓 𝑻𝒉𝒂𝒏 𝑶𝒕𝒉𝒆𝒓𝒔</b>
👑 <b>𝑱𝒐𝒊𝒏 𝑵𝒐𝒘 & 𝑺𝒕𝒂𝒏𝒅 𝑶𝒖𝒕</b>

━━━✦ <b>𝐉𝐎𝐈𝐍 𝐍𝐎𝐖</b> ✦━━━

╔═══━━━✦❘༻༺❘✦━━━═══╗
💎 <b>𝑷𝒓𝒆𝒎𝒊𝒖𝒎 𝑺𝒆𝒓𝒗𝒊𝒄𝒆</b>
🚀 <b>𝑭𝒂𝒔𝒕 𝑹𝒆𝒔𝒖𝒍𝒕</b>
╚═══━━━✦❘༻༺❘✦━━━═══╝`,
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

      console.log("START MESSAGE SENT");

      return res.status(200).json({
        success: true,
        command: "start",
      });
    }

    // =====================================
    // /help
    // =====================================
    if (/^\/help(?:@\w+)?$/i.test(text)) {
      console.log("HELP COMMAND RECEIVED");

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

      console.log("HELP MESSAGE SENT");

      return res.status(200).json({
        success: true,
        command: "help",
      });
    }

    // =====================================
    // Normal message
    // =====================================
    if (!text.startsWith("/")) {
      console.log("NORMAL MESSAGE RECEIVED");

      await bot.sendMessage(
        chatId,
        `Hello ${firstName}`
      );

      console.log("NORMAL MESSAGE SENT");

      return res.status(200).json({
        success: true,
        command: "message",
      });
    }

    // =====================================
    // Unknown command
    // =====================================
    console.log("UNKNOWN COMMAND:", text);

    await bot.sendMessage(
      chatId,
      `❌ Unknown command.

Use /help to see available commands.`
    );

    return res.status(200).json({
      success: true,
      command: "unknown",
    });

  } catch (error) {
    console.error("=================================");
    console.error("WEBHOOK ERROR");
    console.error(
      error.response?.body || error.message || error
    );
    console.error("=================================");

    /*
      Telegram ko 200 response dena better hai,
      taaki same update baar-baar retry na ho.
    */
    return res.status(200).json({
      success: false,
      error: error.response?.body || error.message,
    });
  }
}