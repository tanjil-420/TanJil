const mongoose = require("mongoose");

// Schema Definition
const cmdSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  name: { type: String, default: "User" },
  total: { type: Number, default: 0 },
  commands: { type: Map, of: Number, default: {} }
});

const CmdLeaderboard = mongoose.models.CmdLeaderboard || mongoose.model("CmdLeaderboard", cmdSchema);

module.exports = {
  config: {
    name: "lbcmdstatus",
    version: "5.0",
    author: "T A N J I L 🎀",
    role: 2,
    category: "system",
    aliases: ["cmdstats", "lb", "commandrank","leaderboard"],
    description: { en: "Advanced command usage leaderboard and personal analytics" },
    guide: { en: "lbcmdstatus | lbcmdstatus @tag | lbcmdstatus [reply]" }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const targetID = event.messageReply ? event.messageReply.senderID : 
                       (Object.keys(event.mentions || {})[0] || (args[0] && !isNaN(args[0]) ? args[0] : event.senderID));

      // Details Output
      if (args.length > 0 || event.messageReply) {
        const userDoc = await CmdLeaderboard.findOne({ userID: targetID });
        if (!userDoc || userDoc.total === 0) return api.sendMessage(`⚠️ No records found for this user.`, event.threadID, event.messageID);

        const sortedCmds = Array.from(userDoc.commands.entries()).sort((a, b) => b[1] - a[1]);
        const rank = (await CmdLeaderboard.find({ total: { $gt: userDoc.total } }).countDocuments()) + 1;

        let output = `┌──────────────────\n         ⚡ Details Analyse ⚡\n\n`;
        output += `❃🪶 User: ${userDoc.name}\n❃🪶 Uid: ${targetID}\n❃🪶 Total: ${userDoc.total} Commands\n❃🪶 Rank: ${rank} Number\n\n            📜 Commands list\n\n`;
        sortedCmds.slice(0, 5).forEach(([cmd, count], i) => {
          output += `${i + 1}. ${cmd} (${count}x)\n`;
        });
        output += `\n     🔖 Author: TanJil.4x 🎀\n└──────────────────`;
        return api.sendMessage(output, event.threadID, event.messageID);
      }

      // List Output
      const allUsers = await CmdLeaderboard.find({}).sort({ total: -1 }).limit(10);
      let lb = `┌─〔 𝐋𝐄𝐀𝐃𝐄𝐑𝐁𝐎𝐀𝐑𝐃 〕──\n\n`;
      for (let i = 0; i < allUsers.length; i++) {
        lb += `❃ ${allUsers[i].name} : ${allUsers[i].total} Commands\n`;
      }
      lb += `\n\n└──────────────────\n💡 Tip: Tag/Reply/Uid to view deep status.\n\n🔖 Author: TanJil.4x 🎀`;
      return api.sendMessage(lb, event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
    }
  },

  onChat: async function ({ event, api }) {
    const text = event.body || "";
    if (!text.startsWith("/") && !text.startsWith("!") && !text.startsWith(".")) return;
    
    const cmd = text.slice(1).trim().split(/ +/)[0].toLowerCase();
    if (!cmd) return;

    try {
      const userInfo = await api.getUserInfo(event.senderID);
      const userName = userInfo[event.senderID]?.name || "User";

      let userDoc = await CmdLeaderboard.findOne({ userID: event.senderID });
      if (!userDoc) {
        userDoc = new CmdLeaderboard({ userID: event.senderID, name: userName, total: 0, commands: new Map() });
      } else {
        userDoc.name = userName; // Keep name updated
      }

      userDoc.total += 1;
      userDoc.commands.set(cmd, (userDoc.commands.get(cmd) || 0) + 1);
      await userDoc.save();
    } catch (err) {
      console.error("Tracker Error:", err);
    }
  }
};
  
