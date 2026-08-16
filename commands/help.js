export default function helpCommand(bot) {
  bot.onText(/^\/help(?:@\w+)?$/i, async (msg) => {
    try {
      await bot.sendMessage(
        msg.chat.id,
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
    } catch (error) {
      console.error(
        "HELP COMMAND ERROR:",
        error.response?.body || error.message
      );
    }
  });
}