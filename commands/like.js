import ejs from "ejs";
import path from "path";

export default function startCommand(bot) {
  bot.onText(/\/(like|ind)(?: ind (\d{1,12}))?/i, async (msg, match) => {
    const command = match[1];
    const uid = match[2] || null;


    const html = await ejs.renderFile(
      path.join(process.cwd(), "views", "details.ejs"),
      { uid }
    );



    bot.sendMessage(msg.chat.id, html, {
      parse_mode: "HTML",
    });
  });
}