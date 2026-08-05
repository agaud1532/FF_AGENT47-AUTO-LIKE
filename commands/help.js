export default function helpCommand(bot) {
  bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, "Available Commands:\n/start\n/help\n/like\n/ind");
  });
}