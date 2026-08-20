const { getData } = require("../utils/dataStore");

module.exports = {
  config: {
    name: "diamondlist",
    aliases: ["dml", "topdm"],
    version: "1.0",
    author: "T A N J I L 🎀",
    role: 0,
    category: "game",
    description: "Displays the top 15 users with the most diamonds",
    guide: { en: "{pn}" }
  },

  onStart: async function({ message, usersData }) {

    const diamondData = await getData("diamond");

    const formatDiamond = (n) => {
      const units = ["", "K", "M", "B", "T", "Q", "Qi", "Sx", "Sp", "Oc", "N", "D"];
      let unit = 0;
      let number = Number(n);

      while (number >= 1000 && unit < units.length - 1) {
        number /= 1000;
        unit++;
      }

      return `${number.toFixed(2)}${units[unit]}💎`;
    };

    const diamondArray = Object.keys(diamondData || {}).map(uid => ({
      uid,
      diamond: Number(diamondData[uid]?.amount || 0)
    }));

    const topUsers = diamondArray
      .filter(user => Number.isFinite(user.diamond) && user.diamond > 0)
      .sort((a, b) => b.diamond - a.diamond)
      .slice(0, 15);

    if (topUsers.length === 0) {
      return message.reply("💎 No diamond data available yet.");
    }

    let msg = "╭──────────────╮\n";
    msg += "│ 💎 𝗗𝗜𝗔𝗠𝗢𝗡𝗗 𝗥𝗢𝗬𝗔𝗟𝗦\n";
    msg += "│ 🏆 𝗧𝗢𝗣 𝟭𝟱 𝗟𝗘𝗔𝗗𝗘𝗥𝗕𝗢𝗔𝗥𝗗\n";
    msg += "╰──────────────╯\n\n";

    for (let i = 0; i < topUsers.length; i++) {
      const { uid, diamond } = topUsers[i];

      let userData = null;

      try {
        userData = await usersData.get(uid);
      } catch {}

      const name = userData?.name || "User";

      const rank =
        i === 0 ? "🥇" :
        i === 1 ? "🥈" :
        i === 2 ? "🥉" :
        `🏅 ${i + 1}`;

      msg += `${rank} ${name}\n`;
      msg += `   💎 ${formatDiamond(diamond)}\n`;
      msg += `   🆔 ${uid}\n\n`;
    }

    msg += "━━━━━━━━━━━━━━━━━━\n";
    msg += "💫 Keep playing and collect more diamonds!";

    return message.reply(msg);
  }
};
