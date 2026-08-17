const fs = require("fs-extra");
const path = require("path");

const dbDir = path.join(__dirname, "..", "database");
const dbFile = path.join(dbDir, "cmd_leaderboard.json");

async function getDatabase() {
  await fs.ensureDir(dbDir);
  if (!(await fs.pathExists(dbFile))) {
    await fs.writeJson(dbFile, {}, { spaces: 2 });
  }
  return await fs.readJson(dbFile);
}

module.exports = {
  config: {
    name: "lbcmdstatus",
    version: "3.0",
    author: "T A N J I L 🎀",
    role: 2,
    category: "system",
    aliases: ["cmdstats", "lb", "rank"],
    description: { en: "Comprehensive command usage leaderboard and personal analytics" },
    guide: { en: "lbcmdstatus | lbcmdstatus @tag | lbcmdstatus [reply]" }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const db = await getDatabase();
      const targetID = event.messageReply 
        ? event.messageReply.senderID 
        : (Object.keys(event.mentions || {})[0] || (args[0] && !isNaN(args[0]) ? args[0] : event.senderID));

      const userInfo = await api.getUserInfo(targetID);
      const name = userInfo[targetID]?.name || "Unknown User";

      if (args.length > 0 || event.messageReply) {
        const userData = db[targetID];
        if (!userData || !userData.commands) {
          return api.sendMessage(`⚠️ No records found for: ${name}`, event.threadID, event.messageID);
        }

        const sortedCmds = Object.entries(userData.commands).sort((a, b) => b[1] - a[1]);
        let output = `┌───〔 📊 𝐀𝐍𝐀𝐋𝐘𝐓𝐈𝐂𝐒 〕───\n`;
        output += `│ 👤 User: ${name}\n`;
        output += `│ 🆔 UID : ${targetID}\n`;
        output += `│ 📈 Total: ${userData.total || 0} commands\n`;
        output += `├──────────────────\n`;
        sortedCmds.slice(0, 10).forEach(([cmd, count], i) => {
          output += `│ #${i + 1} ❯ ${cmd.padEnd(10)} : ${count}\n`;
        });
        output += `└──────────────────\n- Dev by TanJil.4x`;
        return api.sendMessage(output, event.threadID, event.messageID);
      }

      const allUsers = Object.entries(db)
        .map(([id, data]) => ({ id, total: data.total || 0 }))
        .sort((a, b) => b.total - a.total);

      let lb = `┌───〔 🏆 𝐋𝐄𝐀𝐃𝐄𝐑𝐁𝐎𝐀𝐑𝐃 〕───\n`;
      for (let i = 0; i < Math.min(10, allUsers.length); i++) {
        const uID = allUsers[i].id;
        const uInfo = await api.getUserInfo(uID);
        const uName = uInfo[uID]?.name || "User";
        const icon = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🔹";
        lb += `│ ${icon} ${uName.slice(0, 12).padEnd(12)} : ${allUsers[i].total}\n`;
      }
      lb += `└──────────────────\n💡 Tip: Tag/Reply to view deep stats.\n- Dev by TanJil.4x`;
      api.sendMessage(lb, event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
    }
  },

  onChat: async function ({ event }) {
    const text = event.body || "";
    if (!text.startsWith("/") && !text.startsWith("!") && !text.startsWith(".")) return;
    
    const cmd = text.slice(1).trim().split(/ +/)[0].toLowerCase();
    const db = await getDatabase();
    const sID = event.senderID;

    if (!db[sID]) db[sID] = { total: 0, commands: {} };
    db[sID].total++;
    db[sID].commands[cmd] = (db[sID].commands[cmd] || 0) + 1;
    await saveDatabase(db);
  }
};

async function saveDatabase(data) {
  await fs.writeJson(dbFile, data, { spaces: 2 });
                                             }
          
