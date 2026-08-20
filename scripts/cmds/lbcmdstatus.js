const mongoose = require("mongoose");

// ============================================================
// MongoDB Connection
// MongoDB URI config.json -> global.GoatBot.config.mongodb
// ============================================================

let mongoConnected = false;
let mongoConnecting = null;

async function connectMongoDB() {
  try {
    // Already connected
    if (mongoose.connection.readyState === 1) {
      mongoConnected = true;
      return true;
    }

    // Connection already in progress
    if (mongoConnecting) {
      return await mongoConnecting;
    }

    const mongoURI = global.GoatBot?.config?.mongodb;

    if (!mongoURI) {
      console.error(
        "[LBCMDSTATUS] MongoDB URI not found in config.json"
      );
      return false;
    }

    mongoConnecting = mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000
    });

    await mongoConnecting;

    mongoConnected = true;
    mongoConnecting = null;

    console.log("[LBCMDSTATUS] MongoDB Connected ✅");

    return true;
  } catch (error) {
    mongoConnecting = null;
    mongoConnected = false;

    console.error(
      "[LBCMDSTATUS] MongoDB Connection Error:",
      error.message
    );

    return false;
  }
}


// ============================================================
// Schema
// ============================================================

const cmdSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    name: {
      type: String,
      default: "User"
    },

    total: {
      type: Number,
      default: 0
    },

    commands: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  {
    timestamps: true
  }
);


const CmdLeaderboard =
  mongoose.models.CmdLeaderboard ||
  mongoose.model("CmdLeaderboard", cmdSchema);


// ============================================================
// Helper Functions
// ============================================================

function getTargetUserID(event, args) {
  /*
   Priority:
   1. Reply
   2. Mention
   3. UID
   4. Current user
  */

  // Reply
  if (event.messageReply?.senderID) {
    return event.messageReply.senderID;
  }

  // Mention
  const mentions = Object.keys(event.mentions || {});

  if (mentions.length > 0) {
    return mentions[0];
  }

  // UID
  const possibleUID = args.find(arg => /^\d+$/.test(arg));

  if (possibleUID) {
    return possibleUID;
  }

  // Self
  return event.senderID;
}


function isDetailCommand(args) {
  if (!args || !args.length) return false;

  const firstArg = args[0].toLowerCase();

  return (
    firstArg === "detail" ||
    firstArg === "details" ||
    firstArg === "-d"
  );
}


function getCleanTargetArgs(args) {
  if (!args || !args.length) return [];

  const firstArg = args[0].toLowerCase();

  if (
    firstArg === "detail" ||
    firstArg === "details" ||
    firstArg === "-d"
  ) {
    return args.slice(1);
  }

  return args;
}


function sortCommands(commandMap) {
  return Array.from(commandMap.entries())
    .sort((a, b) => b[1] - a[1]);
}


async function getUserName(api, userID) {
  try {
    const userInfo = await api.getUserInfo(userID);

    return (
      userInfo?.[userID]?.name ||
      "User"
    );
  } catch (error) {
    return "User";
  }
}


// ============================================================
// Module
// ============================================================

module.exports = {

  config: {
    name: "lbcmdstatus",
    version: "6.0",
    author: "T A N J I L 🎀",
    role: 0,
    category: "system",

    aliases: [
      "cmdstats",
      "lb",
      "commandrank",
      "leaderboard"
    ],

    description: {
      en: "Advanced command usage leaderboard and personal command analytics"
    },

    guide: {
      en:
        "lbcmdstatus\n" +
        "lbcmdstatus detail\n" +
        "lbcmdstatus detail @tag\n" +
        "lbcmdstatus detail [reply]\n" +
        "lbcmdstatus detail [uid]"
    }
  },


  // ==========================================================
  // Command
  // ==========================================================

  onStart: async function ({
    api,
    event,
    args
  }) {

    try {

      // ------------------------------------------------------
      // Connect MongoDB
      // ------------------------------------------------------

      const connected = await connectMongoDB();

      if (!connected) {
        return api.sendMessage(
          "❌ MongoDB connection failed.\n\nPlease check your MongoDB configuration in config.json.",
          event.threadID,
          event.messageID
        );
      }


      // ------------------------------------------------------
      // DETAILS MODE
      // /lbcmdstatus detail
      // /lbcmdstatus -d
      // /lbcmdstatus detail @tag
      // /lbcmdstatus detail UID
      // /lbcmdstatus detail + reply
      // ------------------------------------------------------

      if (isDetailCommand(args)) {

        const targetArgs = getCleanTargetArgs(args);

        const targetID = getTargetUserID(
          event,
          targetArgs
        );


        // ----------------------------------------------------
        // Find User
        // ----------------------------------------------------

        const userDoc = await CmdLeaderboard.findOne({
          userID: targetID
        });


        if (!userDoc || userDoc.total <= 0) {

          return api.sendMessage(
            `⚠️ No command usage records found for this user.\n\nUID: ${targetID}`,
            event.threadID,
            event.messageID
          );
        }


        // ----------------------------------------------------
        // Update username
        // ----------------------------------------------------

        const latestName = await getUserName(
          api,
          targetID
        );

        if (
          latestName &&
          latestName !== "User" &&
          latestName !== userDoc.name
        ) {
          userDoc.name = latestName;
          await userDoc.save();
        }


        // ----------------------------------------------------
        // Rank
        // ----------------------------------------------------

        const rank =
          (await CmdLeaderboard.countDocuments({
            total: {
              $gt: userDoc.total
            }
          })) + 1;


        // ----------------------------------------------------
        // Sort ALL Commands
        // ----------------------------------------------------

        const sortedCommands = sortCommands(
          userDoc.commands
        );


        // ----------------------------------------------------
        // Calculate unique commands
        // ----------------------------------------------------

        const uniqueCommands =
          sortedCommands.length;


        // ----------------------------------------------------
        // Details Output
        // ----------------------------------------------------

        let output =
`╭━━━〔 ⚡ COMMAND DETAILS ⚡ 〕━━━╮

👤 User      : ${userDoc.name}
🆔 UID       : ${targetID}
🏆 Rank      : #${rank}
📊 Total     : ${userDoc.total}
📁 Commands  : ${uniqueCommands}

━━━━━━━━━━━━━━━━━━━━

📜 COMMAND USAGE
`;


        // ----------------------------------------------------
        // Show EVERY command
        // ----------------------------------------------------

        sortedCommands.forEach(
          ([commandName, count], index) => {

            output +=
              `\n${index + 1}. ${commandName} ─ ${count}x`;
          }
        );


        output +=
`

━━━━━━━━━━━━━━━━━━━━

📈 Total Commands : ${userDoc.total}
📁 Unique Files   : ${uniqueCommands}

━━━━━━━━━━━━━━━━━━━━

🔖 Developer : TanJil.4x 🎀

╰━━━━━━━━━━━━━━━━━━━━╯`;


        return api.sendMessage(
          output,
          event.threadID,
          event.messageID
        );
      }


      // ======================================================
      // LEADERBOARD MODE
      // /lbcmdstatus
      // ======================================================

      const allUsers =
        await CmdLeaderboard
          .find({})
          .sort({
            total: -1
          })
          .limit(10);


      // ------------------------------------------------------
      // No data
      // ------------------------------------------------------

      if (!allUsers.length) {

        return api.sendMessage(
          `╭━━━〔 🏆 COMMAND LEADERBOARD 〕━━━╮

⚠️ No command usage data available yet.

╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
          event.threadID,
          event.messageID
        );
      }


      // ------------------------------------------------------
      // Leaderboard
      // ------------------------------------------------------

      let leaderboard =
`╭━━━〔 🏆 COMMAND LEADERBOARD 〕━━━╮

`;


      allUsers.forEach(
        (user, index) => {

          let position;

          if (index === 0) {
            position = "🥇";
          } else if (index === 1) {
            position = "🥈";
          } else if (index === 2) {
            position = "🥉";
          } else {
            position = `${index + 1}.`;
          }


          leaderboard +=
`\n${position} ${user.name}
   └─ ${user.total} Commands`;
        }
      );


      leaderboard +=
`

━━━━━━━━━━━━━━━━━━━━

📊 Showing Top ${allUsers.length}
💡 Use:

/lbcmdstatus detail
/lbcmdstatus detail @tag
/lbcmdstatus detail [reply]
/lbcmdstatus detail [uid]

🔖 Developer : TanJil.4x 🎀

╰━━━━━━━━━━━━━━━━━━━━╯`;


      return api.sendMessage(
        leaderboard,
        event.threadID,
        event.messageID
      );

    } catch (error) {

      console.error(
        "[LBCMDSTATUS] Error:",
        error
      );

      return api.sendMessage(
        "❌ Something went wrong while processing command statistics.",
        event.threadID,
        event.messageID
      );
    }
  },


  // ==========================================================
  // COMMAND TRACKER
  // ==========================================================

  onChat: async function ({
    event,
    api
  }) {

    const text = event.body || "";

    // Only commands beginning with / ! .
    if (
      !text.startsWith("/") &&
      !text.startsWith("!") &&
      !text.startsWith(".")
    ) {
      return;
    }


    const commandName = text
      .slice(1)
      .trim()
      .split(/\s+/)[0]
      .toLowerCase();


    if (!commandName) return;


    try {

      // ------------------------------------------------------
      // MongoDB
      // ------------------------------------------------------

      const connected = await connectMongoDB();

      if (!connected) return;


      // ------------------------------------------------------
      // User info
      // ------------------------------------------------------

      const userName =
        await getUserName(
          api,
          event.senderID
        );


      // ------------------------------------------------------
      // Find/Create user
      // ------------------------------------------------------

      let userDoc =
        await CmdLeaderboard.findOne({
          userID: event.senderID
        });


      if (!userDoc) {

        userDoc =
          new CmdLeaderboard({
            userID: event.senderID,
            name: userName || "User",
            total: 0,
            commands: new Map()
          });

      } else {

        // Keep username updated
        if (
          userName &&
          userName !== "User"
        ) {
          userDoc.name = userName;
        }
      }


      // ------------------------------------------------------
      // Increase total
      // ------------------------------------------------------

      userDoc.total += 1;


      // ------------------------------------------------------
      // Increase command usage
      // ------------------------------------------------------

      const oldCount =
        userDoc.commands.get(commandName) || 0;


      userDoc.commands.set(
        commandName,
        oldCount + 1
      );


      // ------------------------------------------------------
      // Save
      // ------------------------------------------------------

      await userDoc.save();


    } catch (error) {

      console.error(
        "[LBCMDSTATUS] Tracker Error:",
        error.message
      );
    }
  }
};
