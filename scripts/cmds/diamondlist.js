const {
  loadJSON
} = require("../utils/dataStore");

module.exports = {
  config: {
    name: "diamondlist",
    aliases: ["dml", "topdm"],
    version: "2.0.0",
    author: "T A N J I L 🎀",
    role: 0,
    category: "game",
    description: "Displays the top 15 users with the most diamonds",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({
    message,
    usersData
  }) {

    const diamondData = loadJSON("diamond.json");

    const formatDiamond = value => {
      let number = Number(value) || 0;

      const units = [
        "",
        "K",
        "M",
        "B",
        "T",
        "Q",
        "Qi",
        "Sx",
        "Sp",
        "Oc",
        "N",
        "D"
      ];

      let unit = 0;

      while (
        number >= 1000 &&
        unit < units.length - 1
      ) {
        number /= 1000;
        unit++;
      }

      return `${number.toFixed(2)}${units[unit]}💎`;
    };

    const diamondArray = Object.entries(
      diamondData || {}
    )
      .map(([uid, amount]) => ({
        uid: String(uid),
        diamond: Number(amount)
      }))
      .filter(
        user =>
          Number.isFinite(user.diamond) &&
          user.diamond > 0
      )
      .sort(
        (a, b) => b.diamond - a.diamond
      )
      .slice(0, 15);

    if (!diamondArray.length) {
      return message.reply(
        "💎 No diamond data available yet."
      );
    }

    let msg =
      `╭━━━〔 💎 DIAMOND ROYALS 〕━━━╮\n` +
      `┃ 🏆 TOP 15 LEADERBOARD\n` +
      `╰━━━━━━━━━━━━━━━━━━━━╯\n\n`;

    for (let i = 0; i < diamondArray.length; i++) {

      const {
        uid,
        diamond
      } = diamondArray[i];

      let name = "User";

      try {
        const userData =
          await usersData.get(uid);

        name =
          userData?.name || "User";
      } catch {}

      const rank =
        i === 0
          ? "🥇"
          : i === 1
          ? "🥈"
          : i === 2
          ? "🥉"
          : `🏅 ${i + 1}`;

      msg +=
        `${rank} ${name}\n` +
        `   💎 ${formatDiamond(diamond)}\n` +
        `   🆔 ${uid}\n\n`;
    }

    msg +=
      `━━━━━━━━━━━━━━━━━━\n` +
      `💫 Keep playing and collect more diamonds!`;

    return message.reply(msg);
  }
};
