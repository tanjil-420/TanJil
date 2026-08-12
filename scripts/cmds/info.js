const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "info",
    aliases: ["owner"],
    version: "1.6.9",
    author: "Nazrul",
    usePrefix: false,
    isPremium: false,
    countDown: 5,
    role: 0,
    description: "Show Owner info via contact share!",
    category: "owner",
    guide: { en: "{pn} info" },
  },

  onStart: async function ({ api, event, usersData }) {
    const senderID = "61590015983221";
    const userData = await usersData.get(senderID);

    const name = userData.name || " Hussain 💫🎀";
    const vanity = userData.vanity || "hussain.6x";
    const data = userData.data || {};
    const number = data.number || "8801965142856";
    const address = data.address || "Sylhet;💫";
    const relationship = data.relationship || "Single ultra pro potai ne💙💫";
    const birthday = data.birthday || "03/June"

    const github = "sor🍼";

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
      `✩ Birthday: ${birthday}`,
      `✧ Address: ${address}`,
      `❃ Relationship: ${relationship}`,
      `✩ WhatsApp: ${number}`,
      `✧ GitHub: ${github}`,
      `✩ Today date: ${date}`,
      `✧ Time: ${time}`,
      `❃ Bot Uptime: ${uptimeString}`
    ];

    const msgBody = `🪶 Owner Information🎀\n\n${lines.join("\n")}`;
    await api.shareContact(msgBody, senderID, event.threadID);
  },
};