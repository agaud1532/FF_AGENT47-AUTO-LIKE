export default function startCommand(bot) {
  bot.onText(/\/start/i, (msg) => {
    bot.sendMessage(
      msg.chat.id,
      `👋 <b>Welcome ${msg.from.first_name}!</b>

╔═══━━━✦❘༻༺❘✦━━━═══╗  
      🔥 𝐀𝐔𝐓𝐎𝐋𝐈𝐊𝐄 𝐆𝐑𝐎𝐔𝐏 🔥  
╚═══━━━✦❘༻༺❘✦━━━═══╝  

💯 𝑹𝒆𝒂𝒍 & 𝑰𝒏𝒔𝒕𝒂𝒏𝒕 𝑳𝒊𝒌𝒆𝒔 𝑮𝒖𝒂𝒓𝒂𝒏𝒕𝒆𝒆𝒅  
⚡ 𝑮𝒓𝒐𝒘 𝑭𝒂𝒔𝒕𝒆𝒓 𝑻𝒉𝒂𝒏 𝑶𝒕𝒉𝒆𝒓𝒔  
👑 𝑱𝒐𝒊𝒏 𝑵𝒐𝒘 & 𝑺𝒕𝒂𝒏𝒅 𝑶𝒖𝒕  

      ━━━✦ 𝐉𝐎𝐈𝐍 𝐍𝐎𝐖 ✦━━━
╔═══━━━✦❘༻༺❘✦━━━═══╗  
💎 𝑷𝒓𝒆𝒎𝒊𝒖𝒎 𝑺𝒆𝒓𝒗𝒊𝒄𝒆 | 🚀 𝑭𝒂𝒔𝒕 𝑹𝒆𝒔𝒖𝒍𝒕  
╚═══━━━✦❘༻༺❘✦━━━═══╝`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📢 JOIN GROUP",
                url: "https://t.me/freefiregloryORlikesbot",

              }
            ],
            [
              {
                text: "📢 AGENT47",
                url: "t.me/FF_AGENT47"
              }
            ]
          ]
        }
      }
    );
  });
}