const os = require("os");
const pidusage = require("pidusage");
const fs = require("fs");
const { exec } = require("child_process");

// Global start time for uptime calculation
if (!global.startTime) global.startTime = Date.now();

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up"],
    version: "2.3",
    author: "T A N J I L 🎀",
    countDown: 1,
    role: 0,
    shortDescription: "Show system and bot status",
    longDescription: "Displays uptime, CPU, memory, disk, and bot stats",
    category: "info",
    guide: "{pn}",
    noPrefix: true
  },

  onStart: async function (ctx) {
    await module.exports.sendUptime(ctx);
  },

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

    // Convert seconds to readable format
    const toTime = (sec) => {
      const d = Math.floor(sec / 86400);
      const h = Math.floor((sec % 86400) / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = Math.floor(sec % 60);
      return `${d ? `${d}d ` : ""}${h}h ${m}m ${s}s`;
    };

    // Bot uptime calculated without process.uptime()
    const uptimeBot = Math.floor((Date.now() - global.startTime) / 1000);
    const uptimeSys = os.uptime();

    let usage;
    try {
      usage = await pidusage(process.pid);
    } catch {
      usage = { memory: 0, cpu: 0 };
    }

    const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const freeRam = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
    const usedRam = ((usage.memory || 0) / 1024 / 1024).toFixed(1);
    const cpuUsage = (usage.cpu || 0).toFixed(1);
    const cpuModel = os.cpus()[0]?.model || "Unknown";
    const cpuCores = os.cpus().length;

    let pkgCount = 0;
    try {
      pkgCount = Object.keys(JSON.parse(fs.readFileSync("package.json")).dependencies || {}).length;
    } catch {
      pkgCount = "N/A";
    }

    const users = await usersData.getAll().catch(() => []);
    const threads = await threadsData.getAll().catch(() => []);

    // Get disk usage dynamically (Linux/Mac)
    const getDiskUsage = () =>
      new Promise((resolve) => {
        exec("df -h --output=used,avail / | tail -n1", (err, stdout) => {
          if (err) return resolve({ used: "N/A", avail: "N/A" });
          const [used, avail] = stdout.trim().split(/\s+/);
          resolve({ used, avail });
        });
      });

    const disk = await getDiskUsage();

    const msg = `
📅 Date: ${formatDate}

⏱️ Bot uptime: ${toTime(uptimeBot)}
🖥️ System uptime: ${toTime(uptimeSys)}

💻 CPU: ${cpuModel}
💻 Cores: ${cpuCores}
💻 Load: ${cpuUsage}%

💾 RAM: ${usedRam} MB / ${totalRam} GB
💾 Free memory: ${freeRam} GB

📦 Packages: ${pkgCount}
👥 Users: ${users.length}
👨‍👩‍👧‍👦 Groups: ${threads.length}

🗂️ Disk used: ${disk.used}
📁 Available: ${disk.avail}
`;

    message.reply(msg);
  }
};
