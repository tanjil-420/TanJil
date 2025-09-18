module.exports = {
  config: {
    name: "top",
    aliases: ["tp"],
    version: "1.1",
    author: "T A N J I L 🎀",
    role: 0,
    shortDescription: {
      en: "Top 15 Rich Users"
    },
    longDescription: {
      en: "Displays the top 15 richest users with their name, UID, and money"
    },
    category: "group",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, args, message, event, usersData }) {
    function formatMoney(amount) {
      if (amount >= 1e33) return `${(amount / 1e33).toFixed(2)} Dc💵`;
      if (amount >= 1e30) return `${(amount / 1e30).toFixed(2)} No💵`;
      if (amount >= 1e27) return `${(amount / 1e27).toFixed(2)} Oc💵`;
      if (amount >= 1e24) return `${(amount / 1e24).toFixed(2)} Sp💵`;
      if (amount >= 1e21) return `${(amount / 1e21).toFixed(2)} Sx💵`;
      if (amount >= 1e18) return `${(amount / 1e18).toFixed(2)} Qi💵`;
      if (amount >= 1e15) return `${(amount / 1e15).toFixed(2)} Qa💵`;
      if (amount >= 1e12) return `${(amount / 1e12).toFixed(2)} T💵`;
      if (amount >= 1e9)  return `${(amount / 1e9).toFixed(2)} B💵`;
      if (amount >= 1e6)  return `${(amount / 1e6).toFixed(2)} M💵`;
      if (amount >= 1e3)  return `${(amount / 1e3).toFixed(2)} K💵`;
      return `${amount} 💵`;
    }

    const allUsers = await usersData.getAll();
    const topUsers = allUsers
      .sort((a, b) => b.money - a.money)
      .slice(0, 15);

    const topUsersList = topUsers.map((user, index) =>
      `${index + 1}. 🎀 Name: ${user.name}\n    UID: ${user.userID}\n   💸 Balance: ${formatMoney(user.money)}`
    );

    const messageText = `🎉 𝗧𝗢𝗣 𝟭𝟱 𝗥𝗜𝗖𝗛𝗘𝗦𝗧 𝗨𝗦𝗘𝗥𝗦 🎉\n\n${topUsersList.join('\n\n')}\n\n⚡ Keep earning and climb to the top! ⚡`;

    message.reply(messageText);
  }
};
