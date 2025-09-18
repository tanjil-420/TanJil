const fs = require("fs-extra");

module.exports = {
  config: {
    name: "info",
    version: "4.0",
    author: "T A N J I L 🎀",
    shortDescription: "Show Owner and Bot Info in styled reply",
    longDescription: "Beautifully formatted information command showing Owner and Bot details",
    category: "INFO",
    guide: {
      en: "[user]",
    },
  },

  onStart: async function ({ message }) {
    const msg = `⎯   🌷 OWNER INFO 🌷 ⎯
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

Name   : TanJil Hasan 🎀
UID    : 61579509758592
U.n.   : picchi143
Age    : 𝟷𝟿+
House  : Dhaka
Status : Single

⎯⎯ [ 🤖 BOT INFO 🤖 ]⎯⎯
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

Name   : 🪶 Cʜᴏᴄᴏʟᴀᴛᴇ ➝ 🌷🩶💋
UID    : 123456789
U.n.   : 𝙴𝚁𝚁𝙾𝚁
Age    : 2+
House  : Indonesia
Status : A.I. System

⎯⎯⎯⎯ [ 🔧 BOT ] ⎯⎯⎯⎯
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
👑 Author : 
🎀 𝚃 𝙰 𝙽 𝙹 𝙸 𝙻 🎀`;

    return message.reply(msg);
  },
};
