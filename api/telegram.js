import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import * as cheerio from "cheerio";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const token = process.env.BOT_TOKEN;

if (!token) {
  throw new Error("BOT_TOKEN is missing");
}

const bot = new TelegramBot(token, {
  polling: false,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================================================
// FREE FIRE PLAYER API
// =====================================================

const SOURCE_PAGE =
  "https://freefirenation.com/free-fire-id-check/";

const AJAX_URL =
  "https://freefirenation.com/wp-admin/admin-ajax.php";

function escapeHTML(value) {
  return String(value ?? "N/A")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function getNonce() {
  const response = await axios.get(SOURCE_PAGE, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151.0.0.0 Safari/537.36",
    },
    timeout: 15000,
  });

  const html = response.data;
  const $ = cheerio.load(html);

  const patterns = [
    /ff_get_player_info[\s\S]{0,1000}?nonce["'\s:=]+["']([^"']+)["']/i,
    /nonce["'\s:=]+["']([^"']+)["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match?.[1]) {
      return match[1];
    }
  }

  let foundNonce = null;

  $("script").each((_, element) => {
    const script = $(element).html() || "";

    const match =
      script.match(
        /ff_get_player_info[\s\S]{0,1000}?nonce["'\s:=]+["']([^"']+)["']/i
      ) ||
      script.match(
        /nonce["'\s:=]+["']([^"']+)["']/i
      );

    if (match?.[1] && !foundNonce) {
      foundNonce = match[1];
    }
  });

  return foundNonce;
}

async function getPlayer(uid) {
  const nonce = await getNonce();

  if (!nonce) {
    throw new Error("Nonce not found");
  }

  const formData = new URLSearchParams();

  formData.append("action", "ff_get_player_info");
  formData.append("uid", uid);
  formData.append("region", "IND");
  formData.append("nonce", nonce);

  const response = await axios.post(
    AJAX_URL,
    formData.toString(),
    {
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded; charset=UTF-8",

        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151.0.0.0 Safari/537.36",

        Referer: SOURCE_PAGE,

        Origin: "https://freefirenation.com",

        Accept:
          "application/json, text/javascript, */*; q=0.01",

        "X-Requested-With": "XMLHttpRequest",
      },

      timeout: 15000,
    }
  );

  return response.data;
}

// =====================================================
// /START
// =====================================================

async function handleStart(chatId, firstName) {
  await bot.sendMessage(
    chatId,
    `👋 <b>Welcome ${escapeHTML(firstName)}!</b>

╔═══━━━✦❘༻༺❘✦━━━═══╗
      🔥 𝐀𝐔𝐓𝐎𝐋𝐈𝐊𝐄 𝐆𝐑𝐎𝐔𝐏 🔥
╚═══━━━✦❘༻༺❘✦━━━═══╝

💯 𝑹𝒆𝒂𝒍 & 𝑰𝒏𝒔𝒕𝒂𝒏𝒕 𝑳𝒊𝒌𝒆𝒔 𝑮𝒖𝒂𝒓𝒂𝒏𝒕𝒆𝒆𝒅
⚡ 𝑮𝒓𝒐𝒘 𝑭𝒂𝒔𝒕𝒆𝒓 𝑻𝒉𝒂𝒏 𝑶𝒕𝒉𝒆𝒓𝒔
👑 𝑱𝒐𝒊𝒏 𝑵𝒐𝒘 & 𝑺𝒕𝒂𝒏𝒅 𝑶𝒖𝒕

      ━━━✦ 𝐉𝐎𝐈𝐍 𝐍𝐎𝐖 ✦━━━`,
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
}

// =====================================================
// /HELP
// =====================================================

async function handleHelp(chatId) {
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
}

// =====================================================
// /GET
// =====================================================

async function handleGet(chatId, uid) {
  console.log("GET COMMAND:", uid);

  await bot.sendMessage(
    chatId,
    `🔎 <b>Checking UID...</b>

🆔 <code>${escapeHTML(uid)}</code>`,
    {
      parse_mode: "HTML",
    }
  );

  try {
    const result = await getPlayer(uid);

    console.log("Player API response:", result);

    if (!result?.success || !result?.data) {
      await bot.sendMessage(
        chatId,
        `❌ <b>Player information nahi mili.</b>

🆔 UID: <code>${escapeHTML(uid)}</code>

UID check karke dobara try karo.`,
        {
          parse_mode: "HTML",
        }
      );

      return;
    }

    const data = result.data;

    const player = data.basicInfo || {};
    const ban = data.ban_check || {};

    const message = `
<b>🎮 FREE FIRE PLAYER</b>

🆔 <b>UID:</b> <code>${escapeHTML(
      player.accountId || uid
    )}</code>

👤 <b>Name:</b> ${escapeHTML(player.nickname)}

🌍 <b>Region:</b> ${escapeHTML(
      player.region ||
      data.detected_region ||
      "IND"
    )}

⭐ <b>Level:</b> ${escapeHTML(player.level)}

✨ <b>EXP:</b> ${escapeHTML(player.exp)}

❤️ <b>Likes:</b> ${escapeHTML(player.liked)}

🏆 <b>Rank:</b> ${escapeHTML(player.rank)}

📊 <b>Ranking Points:</b> ${escapeHTML(
      player.rankingPoints
    )}

🎖️ <b>Badges:</b> ${escapeHTML(
      player.badgeCnt
    )}

🎫 <b>Elite Pass:</b> ${player.hasElitePass
        ? "✅ Yes"
        : "❌ No"
      }

🛡️ <b>Account Status:</b> ${escapeHTML(
        ban.status
      )}

🚫 <b>Permanently Banned:</b> ${ban.is_permanently_banned
        ? "❌ Yes"
        : "✅ No"
      }

🚫 <b>CS Banned:</b> ${ban.is_cs_banned
        ? "❌ Yes"
        : "✅ No"
      }
`;

    await bot.sendMessage(
      chatId,
      message.trim(),
      {
        parse_mode: "HTML",
      }
    );

    console.log("GET RESULT SENT");

  } catch (error) {
    console.error(
      "GET PLAYER ERROR:",
      error.response?.data || error.message
    );

    await bot.sendMessage(
      chatId,
      `❌ <b>Unable to get player information.</b>

🆔 UID: <code>${escapeHTML(uid)}</code>

Please try again later.`,
      {
        parse_mode: "HTML",
      }
    );
  }
}

// =====================================================
// /LIKE
// =====================================================

async function handleLike(chatId, uid) {
  console.log("LIKE COMMAND:", uid);

  try {
    const html = await ejs.renderFile(
      path.join(__dirname, "..", "views", "details.ejs"),
      {
        uid: uid || null,
      }
    );

    await bot.sendMessage(
      chatId,
      html,
      {
        parse_mode: "HTML",
      }
    );

    console.log("LIKE DETAILS SENT");

  } catch (error) {
    console.error(
      "LIKE COMMAND ERROR:",
      error.message
    );

    await bot.sendMessage(
      chatId,
      "❌ Details load nahi ho paayi. Please try again."
    );
  }
}

// =====================================================
// VERCEL WEBHOOK
// =====================================================

export default async function handler(req, res) {

  // GET
  if (req.method === "GET") {
    return res.status(200).json({
      status: "Telegram webhook is working",
    });
  }

  // POST only
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const update = req.body;

    console.log("=================================");
    console.log(
      "TELEGRAM UPDATE:",
      JSON.stringify(update)
    );
    console.log("=================================");

    const message = update?.message;

    if (!message) {
      return res.status(200).json({
        success: true,
      });
    }

    const chatId = message.chat?.id;
    const text = message.text?.trim();
    const firstName =
      message.from?.first_name || "User";

    console.log("CHAT ID:", chatId);
    console.log("TEXT:", text);

    if (!chatId || !text) {
      return res.status(200).json({
        success: true,
      });
    }

    // ==========================================
    // START
    // ==========================================

    if (/^\/start(?:@\w+)?$/i.test(text)) {
      console.log("START RECEIVED");

      await handleStart(
        chatId,
        firstName
      );

      return res.status(200).json({
        success: true,
      });
    }

    // ==========================================
    // HELP
    // ==========================================

    if (/^\/help(?:@\w+)?$/i.test(text)) {
      console.log("HELP RECEIVED");

      await handleHelp(chatId);

      return res.status(200).json({
        success: true,
      });
    }

    // ==========================================
    // GET
    // /get 123456789
    // ==========================================

    const getMatch = text.match(
      /^\/get(?:@\w+)?\s+(\d{1,12})$/i
    );

    if (getMatch) {
      const uid = getMatch[1];

      await handleGet(
        chatId,
        uid
      );

      return res.status(200).json({
        success: true,
      });
    }

    // ==========================================
    // LIKE
    // /like ind 123456789
    // /like 123456789
    // ==========================================

    const likeMatch = text.match(
      /^\/like(?:@\w+)?(?:\s+ind)?(?:\s+(\d{1,12}))?$/i
    );

    if (likeMatch) {
      const uid = likeMatch[1] || null;

      await handleLike(
        chatId,
        uid
      );

      return res.status(200).json({
        success: true,
      });
    }

    // ==========================================
    // NORMAL MESSAGE
    // ==========================================

    if (!text.startsWith("/")) {
      await bot.sendMessage(
        chatId,
        `Hello ${escapeHTML(firstName)}`
      );

      console.log("NORMAL MESSAGE SENT");

      return res.status(200).json({
        success: true,
      });
    }

    // ==========================================
    // UNKNOWN COMMAND
    // ==========================================

    await bot.sendMessage(
      chatId,
      "❌ Unknown command.\n\nUse /help to see available commands."
    );

    return res.status(200).json({
      success: true,
    });

  } catch (error) {

    console.error(
      "================================="
    );

    console.error(
      "WEBHOOK ERROR:",
      error.response?.body ||
      error.message
    );

    console.error(
      "================================="
    );

    return res.status(200).json({
      success: false,
      error:
        error.response?.body ||
        error.message,
    });
  }
}