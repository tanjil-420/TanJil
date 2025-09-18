const fs = require("fs");

module.exports = {
  config: {
    name: "spin list",
    version: "1.0",
    author: "〲T A N J I L ツ",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "View all users' coin balances",
    },
    longDescription: {
      en: "Displays a beautiful leaderboard of all users with their current coin balances.",
    },
    category: "game",
    guide: {
      en: "{pn} - View all users and their balances"
    }
  },

  onStart: async function ({ message, usersData }) {
    const balancePath = __dirname + "/balance.json";

    if (!fs.existsSync(balancePath)) {
      return message.reply("No balance data found.");
    }

    const balances = JSON.parse(fs.readFileSync(balancePath, "utf8"));

    const sortedUsers = Object.entries(balances)
      .sort((a, b) => b[1] - a[1]);

    if (sortedUsers.length === 0) {
      return message.reply("No users have any balance yet.");
    }

    let listMessage = "🏆 𝗨𝘀𝗲𝗿 𝗖𝗼𝗶𝗻 𝗕𝗮𝗹𝗮𝗻𝗰𝗲𝘀 🏆\n\n";
    let rank = 1;

    for (const [userID, balance] of sortedUsers) {
      let userName;
      try {
        const data = await usersData.get(userID);
        userName = data?.name || `UID: ${userID}`;
      } catch (e) {
        userName = `UID: ${userID}`;
      }

      const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "🔹";
      listMessage += `${medal} ${userName} — ${balance} coins\n`;
      rank++;
    }

    message.reply(listMessage);
  }
};
