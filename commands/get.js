import axios from "axios";
import * as cheerio from "cheerio";

const SOURCE_PAGE = "https://freefirenation.com/free-fire-id-check/";
const AJAX_URL = "https://freefirenation.com/wp-admin/admin-ajax.php";

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

  // Common places where a WordPress AJAX nonce may appear.
  const patterns = [
    /ff_get_player_info[\s\S]{0,1000}?nonce["'\s:=]+["']([^"']+)["']/i,
    /nonce["'\s:=]+["']([^"']+)["']/i,
    /["']nonce["']\s*:\s*["']([^"']+)["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match?.[1]) {
      return match[1];
    }
  }

  // Also check inline script text.
  let foundNonce = null;

  $("script").each((_, element) => {
    const script = $(element).html() || "";

    const match =
      script.match(
        /ff_get_player_info[\s\S]{0,1000}?nonce["'\s:=]+["']([^"']+)["']/i
      ) ||
      script.match(/nonce["'\s:=]+["']([^"']+)["']/i);

    if (match?.[1] && !foundNonce) {
      foundNonce = match[1];
    }
  });

  return foundNonce;
}

async function getPlayer(uid) {
  const nonce = await getNonce();

  if (!nonce) {
    throw new Error(
      "Free Fire Nation nonce could not be found. The website may have changed its implementation."
    );
  }

  const formData = new URLSearchParams();

  formData.append("action", "ff_get_player_info");
  formData.append("uid", uid);
  formData.append("region", "IND");
  formData.append("nonce", nonce);

  const response = await axios.post(AJAX_URL, formData.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151.0.0.0 Safari/537.36",
      Referer: SOURCE_PAGE,
      Origin: "https://freefirenation.com",
      Accept: "application/json, text/javascript, */*; q=0.01",
      "X-Requested-With": "XMLHttpRequest",
    },
    timeout: 15000,
  });

  return response.data;
}

export default function getCommand(bot) {
  bot.onText(/^\/get\s+(\d{1,12})$/i, async (msg, match) => {
    const uid = match[1];

    await bot.sendMessage(
      msg.chat.id,
      `🔎 <b>Checking UID...</b>\n\n🆔 <code>${escapeHTML(uid)}</code>`,
      {
        parse_mode: "HTML",
      }
    );

    try {
      const result = await getPlayer(uid);

      console.log("Player API response:", result);

      if (!result?.success || !result?.data) {
        await bot.sendMessage(
          msg.chat.id,
          "❌ Player information nahi mili.\n\nUID check karke dobara try karo.",
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
        player.region || data.detected_region || "IND"
      )}

⭐ <b>Level:</b> ${escapeHTML(player.level)}
✨ <b>EXP:</b> ${escapeHTML(player.exp)}

❤️ <b>Likes:</b> ${escapeHTML(player.liked)}
🏆 <b>Rank:</b> ${escapeHTML(player.rank)}
📊 <b>Ranking Points:</b> ${escapeHTML(player.rankingPoints)}

🎖️ <b>Badges:</b> ${escapeHTML(player.badgeCnt)}
🎫 <b>Elite Pass:</b> ${
        player.hasElitePass ? "✅ Yes" : "❌ No"
      }

🛡️ <b>Account Status:</b> ${escapeHTML(ban.status)}

🚫 <b>Permanently Banned:</b> ${
        ban.is_permanently_banned ? "❌ Yes" : "✅ No"
      }

🚫 <b>CS Banned:</b> ${
        ban.is_cs_banned ? "❌ Yes" : "✅ No"
      }
`;

      await bot.sendMessage(msg.chat.id, message.trim(), {
        parse_mode: "HTML",
      });
    } catch (error) {
      console.error(
        "GET PLAYER ERROR:",
        error.response?.data || error.message
      );

      await bot.sendMessage(
        msg.chat.id,
        `❌ <b>Unable to get player information.</b>

UID: <code>${escapeHTML(uid)}</code>

Please try again later.`,
        {
          parse_mode: "HTML",
        }
      );
    }
  });
}