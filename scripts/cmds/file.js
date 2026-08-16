const fs = require('fs');
const { config } = global.GoatBot;

module.exports = {
  config: {
    name: "givefile",
    aliases: ["file"],
    version: "1.6.9",
    author: "Nazrul",
    countDown: 5,
    role: 0,
    description: "extract file",
    category: "owner",
    guide: "{pn} Write a file name"
  },

  onStart: async function ({ message, args, api, event }) {
    const allowedUIDs = ["61577391264013","61577391264013"];

const userId = event.senderID;

if (!allowedUIDs.includes(userId.toString())) {
    return message.reply('⚠ This command can only be used by Nazrul!');
}

    const fileName = args[0];
    if (!fileName) {
      return api.sendMessage("🔰 provide a file name!", event.threadID, event.messageID);
    }

    const filePath = __dirname + `/${fileName}.js`;
    if (!fs.existsSync(filePath)) {
      return api.sendMessage(`File not found: ${fileName}.js`, event.threadID, event.messageID);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    api.sendMessage({ body: fileContent }, event.threadID);
  }
};
