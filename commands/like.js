import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function likeCommand(bot) {
  bot.onText(
    /^\/(like|ind)(?:\s+ind)?(?:\s+(\d{1,12}))?$/i,
    async (msg, match) => {
      try {
        const uid = match[2] || null;

        const html = await ejs.renderFile(
          path.join(__dirname, "..", "views", "details.ejs"),
          { uid }
        );

        await bot.sendMessage(msg.chat.id, html, {
          parse_mode: "HTML",
        });
      } catch (error) {
        console.error("LIKE COMMAND ERROR:", error);

        await bot.sendMessage(
          msg.chat.id,
          "❌ Details load nahi ho paayi. Please try again."
        );
      }
    }
  );
}