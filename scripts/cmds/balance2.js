const { getUser, setUser } = require("../utils/dataStore");

module.exports = {
  config: {
    name: "balance2",
    aliases: ["bal2"],
    version: "1.0",
    author: "T A N J I L 🎀",
    role: 2,
    shortDescription: {
      en: "Manage users' balance"
    },
    longDescription: {
      en: "Add, remove, transfer or zero out balance of users"
    },
    category: "economy",
    guide: {
      en: "{pn} add/remove/out/transfer [amount] [uid or mention or reply]"
    }
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;
    const action = args[0]?.toLowerCase();
    const amount = parseInt(args[1]);
    let targetID = null;

    const send = (text) => api.sendMessage(text, threadID, messageID);

    if (["add", "remove", "transfer"].includes(action) && (isNaN(amount) || amount <= 0)) {
      return send("❌ Please enter a valid amount.");
    }

    if (mentions && Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    } else if (!isNaN(args[2])) {
      targetID = args[2];
    }

    if (!targetID && action !== "out") {
      return send("❌ Please mention, reply to a user, or provide UID.");
    }

    switch (action) {
      case "add": {
        const userData = await getUser(usersData, targetID);
        const newBalance = Number(userData.money || 0) + amount;

        await setUser(usersData, targetID, {
          money: newBalance
        });

        const name = userData.name || "Unknown User";
        send(`✅ Added ${amount}💵 to ${name}'s balance.`);
        break;
      }

      case "remove": {
        const userData = await getUser(usersData, targetID);
        const currentBalance = Number(userData.money || 0);

        if (currentBalance < amount) {
          return send(`❌ ${userData.name || "User"} doesn't have enough balance.`);
        }

        const newBalance = currentBalance - amount;

        await setUser(usersData, targetID, {
          money: newBalance
        });

        const name = userData.name || "Unknown User";
        send(`✅ Removed ${amount}💵 from ${name}'s balance.`);
        break;
      }

      case "out": {
        if (mentions && Object.keys(mentions).length > 0) {
          targetID = Object.keys(mentions)[0];
        } else if (messageReply) {
          targetID = messageReply.senderID;
        } else if (!isNaN(args[1])) {
          targetID = args[1];
        } else {
          return send("❌ Please specify a user (mention/reply/uid) to reset balance.");
        }

        const userData = await getUser(usersData, targetID);

        await setUser(usersData, targetID, {
          money: 0
        });

        const name = userData.name || "Unknown User";
        send(`❌ ${name}'s balance has been reset to 0.`);
        break;
      }

      case "transfer": {
        if (targetID == senderID) {
          return send("❌ You can't transfer to yourself.");
        }

        const senderData = await getUser(usersData, senderID);
        const targetData = await getUser(usersData, targetID);

        const senderBalance = Number(senderData.money || 0);

        if (senderBalance < amount) {
          return send("❌ You don't have enough balance to transfer.");
        }

        await setUser(usersData, senderID, {
          money: senderBalance - amount
        });

        await setUser(usersData, targetID, {
          money: Number(targetData.money || 0) + amount
        });

        const targetName = targetData.name || "Unknown User";
        send(`✅ Transferred ${amount}💵 to ${targetName}.`);
        break;
      }

      default:
        send("❗ Usage:\n• balance add [amount] [mention/reply/uid]\n• balance remove [amount] [mention/reply/uid]\n• balance transfer [amount] [mention/reply/uid]\n• balance out [mention/reply/uid]");
    }
  }
};
