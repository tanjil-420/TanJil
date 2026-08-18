const mongoose = require("mongoose");

// Define Schema for Command Leaderboard
const cmdSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  total: { type: Number, default: 0 },
  commands: { type: Map, of: Number, default: {} }
});

const CmdLeaderboard = mongoose.models.CmdLeaderboard || mongoose.model("CmdLeaderboard", cmdSchema);

module.exports = {
  config: {
    name: "lbcmdstatus",
    version: "1.0",
    author: "T A N J I L 🎀",
    role: 2,
    category: "system",
    aliases: ["cmdstats", "lb", "rank"],
    description: { en: "Comprehensive command usage leaderboard and personal analytics using MongoDB" },
    guide: { en: "lbcmdstatus | lbcmdstatus @tag | lbcmdstatus [reply]" }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const targetID = event.messageReply 
        ? event.messageReply.senderID 
        : (Object.keys(event.mentions || {})[0] || (args[0] && !isNaN(args[0]) ? args[0] : event.senderID));

      const userInfo = await api.getUserInfo(targetID);
      const name = userInfo[targetID]?.name || "Unknown User";

      if (args.length > 0 || event.messageReply) {
        const userDoc = await CmdLeaderboard.findOne({ userID: targetID });
        if (!userDoc || !userDoc.commands || userDoc.commands.size === 0) {
          return api.sendMessage(`⚠️ No records found for: ${name}`, event.threadID, event.messageID);
        }

        const sortedCmds = Array.from(userDoc.commands.entries()).sort((a, b) => b[1] - a[1]);
        let output = `┌───〔 📊 𝐀𝐍𝐀𝐋𝐘𝐓𝐈𝐂𝐒 〕───\n`;
        output += `│ 👤 User: ${name}\n`;
        output += `│ 🆔 UID : ${targetID}\n`;
        output += `│ 📈 Total: ${userDoc.total || 0} commands\n`;
        output += `├──────────────────\n`;
        sortedCmds.slice(0, 10).forEach(([cmd, count], i) => {
          output += `│ #${i + 1} ❯ ${cmd.padEnd(10)} : ${count}\n`;
        });
        output += `└──────────────────\n- Dev by TanJil.4x`;
        return api.sendMessage(output, event.threadID, event.messageID);
      }

      const allUsers = await CmdLeaderboard.find({}).sort({ total: -1 }).limit(10);

      if (allUsers.length === 0) {
        return api.sendMessage("⚠️ No command usage data recorded yet.", event.threadID, event.messageID);
      }

      let lb = `┌───〔 🏆 𝐋𝐄𝐀𝐃𝐄𝐑𝐁𝐎𝐀𝐑𝐃 〕───\n`;
      for (let i = 0; i < allUsers.length; i++) {
        const uID = allUsers[i].userID;
        const uInfo = await api.getUserInfo(uID);
        const uName = uInfo[uID]?.name || "User";
        const icon = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🔹";
        lb += `│ ${icon} ${uName.slice(0, 12).padEnd(12)} : ${allUsers[i].total}\n`;
      }
      lb += `└──────────────────\n💡 Tip: Tag/Reply to view deep stats.\n- Dev by TanJil.4x🎀`;
      return api.sendMessage(lb, event.threadID, event.messageID);

    } catch (err) {
      console.error("MongoDB Leaderboard Error:", err);
      return api.sendMessage("❌ An error occurred while fetching the leaderboard.", event.threadID, event.messageID);
    }
  },

  onChat: async function ({ event }) {
    try {
      const text = event.body || "";
      if (!text.startsWith("/") && !text.startsWith("!") && !text.startsWith(".")) return;
      
      const cmd = text.slice(1).trim().split(/ +/)[0].toLowerCase();
      if (!cmd) return;

      const sID = event.senderID;

      let userDoc = await CmdLeaderboard.findOne({ userID: sID });
      if (!userDoc) {
        userDoc = new CmdLeaderboard({ userID: sID, total: 0, commands: new Map() });
      }

      userDoc.total += 1;
      const currentCount = userDoc.commands.get(cmd) || 0;
      userDoc.commands.set(cmd, currentCount + 1);

      await userDoc.save();
    } catch (err) {
      console.error("MongoDB Tracker Error:", err);
    }
  }
};
