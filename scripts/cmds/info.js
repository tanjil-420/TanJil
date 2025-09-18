const fs = require("fs-extra");
const os = require("os");

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

  onStart: async function ({ api, event }) {
    const { threadID, senderID } = event;

    const uptimeSeconds = process.uptime();
    const uptime = formatUptime(uptimeSeconds);
    const system = os.platform();
    const cpu = os.cpus()[0].model;
    const updateMonth = "August 2025";

    const message = `
⎯ [(🌷) OWNER INFO (🌷)] ⎯
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

Name   : TanJil Hasan 🎀
UID    : ${senderID}
U.n.   : tanjilhasan420
Age    : 𝟷𝟿+
House  : Dhaka
Status : Single

⎯⎯ [ 🤖 BOT INFO 🤖 ] ⎯⎯
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

Name   : Hi Na Ta 
UID    : 61579021162546
U.n.   : 𝙴𝚁𝚁𝙾𝚁
Age    : 1+
House  : Indonesia
Status : A.I. System
Uptime : ${uptime}
Update : ${updateMonth}
System : ${system}
CRU    : ${cpu}

⎯⎯⎯⎯ [ 🔧 BOT ] ⎯⎯⎯⎯
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

👑 Author : 🎀 𝚃 𝙰 𝙽 𝙹 𝙸 𝙻 🎀
    `;

    api.sendMessage(message, threadID);
  },
};

function formatUptime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}
