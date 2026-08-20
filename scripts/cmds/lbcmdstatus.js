const mongoose = require("mongoose");

let mongoConnected = false;
let mongoConnecting = null;

async function connectMongoDB() {
  try {
    if (mongoose.connection.readyState === 1) {
      mongoConnected = true;
      return true;
    }
    if (mongoConnecting) return await mongoConnecting;

    const mongoURI = global.GoatBot?.config?.mongodb;
    if (!mongoURI) {
      console.error("[LBCMDSTATUS] MongoDB URI missing");
      return false;
    }

    mongoConnecting = mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 10000 });
    await mongoConnecting;
    mongoConnected = true;
    mongoConnecting = null;
    console.log("[LBCMDSTATUS] MongoDB Connected ✅");
    return true;
  } catch (error) {
    mongoConnecting = null;
    mongoConnected = false;
    console.error("[LBCMDSTATUS] Connection Error:", error.message);
    return false;
  }
}

const cmdSchema = new mongoose.Schema(
  {
    userID: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: "User" },
    total: { type: Number, default: 0 },
    commands: { type: Map, of: Number, default: {} }
  },
  { timestamps: true }
);

const CmdLeaderboard = mongoose.models.CmdLeaderboard || mongoose.model("CmdLeaderboard", cmdSchema);

function getTargetUserID(event, args) {
  if (event.messageReply?.senderID) return event.messageReply.senderID;
  const mentions = Object.keys(event.mentions || {});
  if (mentions.length > 0) return mentions[0];
  const possibleUID = args.find(arg => /^\d+$/.test(arg));
  if (possibleUID) return possibleUID;
  return event.senderID;
}

function isDetailCommand(args) {
  if (!args || !args.length) return false;
  const firstArg = args[0].toLowerCase();
  return firstArg === "detail" || firstArg === "details" || firstArg === "-d";
}

function getCleanTargetArgs(args) {
  if (!args || !args.length) return [];
  const firstArg = args[0].toLowerCase();
  if (firstArg === "detail" || firstArg === "details" || firstArg === "-d") {
    return args.slice(1);
  }
  return args;
}

function sortCommands(commandMap) {
  return Array.from(commandMap.entries()).sort((a, b) => b[1] - a[1]);
}

async function getUserName(api, userID) {
  try {
    const userInfo = await api.getUserInfo(userID);
    return userInfo?.[userID]?.name || "User";
  } catch {
    return "User";
  }
}

module.exports = {
  config: {
    name: "lbcmdstatus",
    version: "6.2",
    author: "T A N J I L 🎀",
    role: 0,
    category: "system",
    aliases: ["cmdstats", "lb", "commandrank", "leaderboard"],
    description: { en: "Advanced command usage leaderboard and personal analytics" },
    guide: { en: "lbcmdstatus\n lbcmdstatus detail [@tag/reply/uid]" }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const connected = await connectMongoDB();
      if (!connected) {
        return api.sendMessage("❌ MongoDB connection failed.", event.threadID, event.messageID);
      }

      if (isDetailCommand(args)) {
        const targetArgs = getCleanTargetArgs(args);
        const targetID = getTargetUserID(event, targetArgs);

        const userDoc = await CmdLeaderboard.findOne({ userID: targetID });
        if (!userDoc || userDoc.total <= 0) {
          return api.sendMessage(`⚠️ No records found.\n\nUID: ${targetID}`, event.threadID, event.messageID);
        }

        const latestName = await getUserName(api, targetID);
        if (latestName && latestName !== "User" && latestName !== userDoc.name) {
          userDoc.name = latestName;
          await userDoc.save();
        }

        const rank = (await CmdLeaderboard.countDocuments({ total: { $gt: userDoc.total } })) + 1;
        const sortedCommands = sortCommands(userDoc.commands);
        const uniqueCommands = sortedCommands.length;

        let output = 
`╭━━━〔 ⚡ COMMAND DETAILS ⚡ 〕━━━╮

👤 User      : ${userDoc.name}
🆔 UID       : ${targetID}
🏆 Rank      : #${rank}
📊 Total     : ${userDoc.total}
📁 Commands  : ${uniqueCommands}

━━━━━━━━━━━━━━━━━━━━

📜 COMMAND USAGE`;

        sortedCommands.forEach(([commandName, count], index) => {
          output += `\n${index + 1}. ${commandName} ─ ${count}x`;
        });

        output += 
`

━━━━━━━━━━━━━━━━━━━━

🔖 Dev : TanJil.4x 🎀

╰━━━━━━━━━━━━━━━━━━━━╯`;

        return api.sendMessage(output, event.threadID, event.messageID);
      }

      const allUsers = await CmdLeaderboard.find({}).sort({ total: -1 }).limit(10);
      if (!allUsers.length) {
        return api.sendMessage("╭━━━〔 🏆 LEADERBOARD 〕━━━╮\n\n⚠️ No data available.\n\n╰━━━━━━━━━━━━━━━━━━━━╯", event.threadID, event.messageID);
      }

      let leaderboard = "╭━━━〔 🏆 LEADERBOARD 〕━━━╮\n";
      allUsers.forEach((user, index) => {
        let pos = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
        leaderboard += `\n${pos} ${user.name}\n   └─ ${user.total} Commands`;
      });

      leaderboard += 
`

━━━━━━━━━━━━━━━━━━━━

🔖 Dev : TanJil.4x 🎀

╰━━━━━━━━━━━━━━━━━━━━╯`;

      return api.sendMessage(leaderboard, event.threadID, event.messageID);

    } catch (error) {
      console.error("[LBCMDSTATUS] Error:", error);
      return api.sendMessage("❌ Error processing command statistics.", event.threadID, event.messageID);
    }
  },

  onChat: async function ({ event, api }) {
    const text = event.body || "";
    if (!text.startsWith("/") && !text.startsWith("!") && !text.startsWith(".")) return;

    const commandName = text.slice(1).trim().split(/\s+/)[0].toLowerCase();
    if (!commandName) return;

    try {
      const connected = await connectMongoDB();
      if (!connected) return;

      const userName = await getUserName(api, event.senderID);
      let userDoc = await CmdLeaderboard.findOne({ userID: event.senderID });

      if (!userDoc) {
        userDoc = new CmdLeaderboard({
          userID: event.senderID,
          name: userName || "User",
          total: 0,
          commands: new Map()
        });
      } else if (userName && userName !== "User") {
        userDoc.name = userName;
      }

      userDoc.total += 1;
      const oldCount = userDoc.commands.get(commandName) || 0;
      userDoc.commands.set(commandName, oldCount + 1);

      await userDoc.save();
    } catch (error) {
      console.error("[LBCMDSTATUS] Tracker Error:", error.message);
    }
  }
};
