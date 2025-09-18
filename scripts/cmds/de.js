module.exports = {
  config: {
    name: "de",
    aliases: ["del"],
    author: "Bayjid",
role: 2,
    category: "system"
  },

  onStart: async function ({ api, event, args }) {
    const fs = require('fs');
    const path = require('path');

    const fileName = args[0];

    if (!fileName) {
      api.sendMessage("Please provide a file name to delete.", event.threadID);
      return;
    }

    const filePath = path.join(__dirname, fileName);

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
        api.sendMessage(`🤷‍♂️ 𝐍𝐚𝐦𝐞 𝐭𝐡𝐞 𝐟𝐢𝐥𝐞 𝐲𝐨𝐮 𝐰𝐚𝐧𝐭 𝐭𝐨 𝐝𝐞𝐥𝐞𝐭𝐞 ${fileName}`, event.threadID);
        return;
      }
      api.sendMessage(`✅ 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 𝐝𝐞𝐥𝐞𝐭𝐞 𝐲𝐨𝐮𝐫 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 ( ${fileName} )`, event.threadID);
    });
  }
};
