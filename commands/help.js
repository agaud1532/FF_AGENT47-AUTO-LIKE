export default function helpCommand(bot) {
  bot.onText(/\/help/i, (msg) => {
    bot.sendMessage(
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
  });
}