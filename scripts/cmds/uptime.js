const os = require("os");
const pidusage = require("pidusage");
const fs = require("fs");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up"],
    version: "2.3",
    author: "EREN + TANJIL",
    countDown: 1,
    role: 0,
    shortDescription: "Show system and bot status",
    longDescription: "Displays uptime, CPU, memory, disk, and bot stats",
    category: "info",
    guide: "{pn}",
    noPrefix: true
  },

  // Normal prefix handler
  onStart: async function (ctx) {
    await module.exports.sendUptime(ctx);
  },

  // noPrefix now public
  onChat: async function (ctx) {
    const input = ctx.event.body?.toLowerCase().trim();
    const { config } = module.exports;
    const triggers = [config.name, ...(config.aliases || [])];

    if (!triggers.includes(input)) return;

    await module.exports.sendUptime(ctx);
  },

  sendUptime: async function ({ message, usersData, threadsData }) {
    const now = new Date();
    const formatDate = now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

    const uptimeBot = process.uptime();
    const uptimeSys = os.uptime();
    const toTime = (sec) => {
      const d = Math.floor(sec / 86400);
      const h = Math.floor((sec % 86400) / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = Math.floor(sec % 60);
      return `${d ? `${d}d ` : ""}${h}h ${m}m ${s}s`;
    };

    const usage = await pidusage(process.pid);
    const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(0);
    const freeRam = (os.freemem() / 1024 / 1024 / 1024).toFixed(0);
    const usedRam = (usage.memory / 1024 / 1024).toFixed(1);
    const cpuUsage = usage.cpu.toFixed(1);
    const cpuModel = os.cpus()[0].model;
    const cpuCores = os.cpus().length;
    const pkgCount = Object.keys(JSON.parse(fs.readFileSync('package.json')).dependencies || {}).length;

    const users = await usersData.getAll();
    const threads = await threadsData.getAll();

    const msg =
`
📅 Date: ${formatDate}

⏱️ Uptime : ${toTime(uptimeBot)}
🖥️ System time : ${toTime(uptimeSys)}

💻CPU : ${cpuModel}
💻CORES : ${cpuCores}
💻LOAD : ${cpuUsage}%

💾 Ram : ${usedRam} MB / ${totalRam} GB
💾Free memory : ${freeRam} GB

📦 Package : ${pkgCount}
👥 User: ${users.length}
👨‍👩‍👧‍👦 Group's : ${threads.length}

🗂️ Disk used : 325G / 387G
📁 Available : 264G
`;

    message.reply(msg);
  }
};
