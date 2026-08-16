const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "info",
    aliases: ["owner"],
    version: "1.6.9",
    author: "Nazrul",
    usePrefix: true,
    isPremium: false,
    countDown: 5,
    role: 0,
    description: "Show Owner info via contact share!",
    category: "owner",
    guide: { en: "{pn} info" },
  },

  onStart: async function ({ api, event, usersData }) {
    const senderID = "61564913640716";
    const userData = await usersData.get(senderID);

    const name = userData.name || "T A N J I L 🎀";
    const vanity = userData.vanity || "4x.tanjil";
    const data = userData.data || {};
    const number = data.number || "8801985208807";
    const address = data.address || "Dhaka";
    const relationship = data.relationship || "Single";
    const birthday = data.birthday || "25/March"

    const github = "Sorry, the fork is my owner's personal. 😾";

    const now = moment().tz("Asia/Dhaka");
    const date = now.format("MMMM Do YYYY");
    const time = now.format("h:mm:ss A");

    const uptime = process.uptime();
    const seconds = Math.floor(uptime % 60);
    const minutes = Math.floor((uptime / 60) % 60);
    const hours = Math.floor((uptime / 3600) % 24);
    const days = Math.floor(uptime / (3600 * 24));
    const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const lines = [
      `❃ Name: ${name}`,
      `❃ Birthday: ${birthday}`,
      `❃ Address: ${address}`,
      `❃ Relationship: ${relationship}`,
      `❃ WhatsApp: ${number}`,
      `❃ GitHub: ${github}`,
      `❃ Today date: ${date}`,
      `❃ Time: ${time}`,
      `❃ Bot Uptime: ${uptimeString}`
    ];

    const msgBody = `🪶 Owner Information🎀\n\n${lines.join("\n")}`;
    await api.shareContact(msgBody, senderID, event.threadID);
  },
};
