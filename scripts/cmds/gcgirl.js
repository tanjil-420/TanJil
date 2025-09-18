const axios = require('axios');
const fs = require('fs-extra');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports = {
  config: {
    name: "gcgirl",
    aliases: [],
    version: "1.0",
    author: "〲T A N J I L ツ",
    role: 0,
    shortDescription: {
      en: "List all girls in group"
    },
    longDescription: {
      en: "Displays a list of all female members in the group with a banner showing their profile pictures"
    },
    category: "Group",
    guide: {
      en: "/gcgirl"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const females = threadInfo.userInfo.filter(u => u.gender === 'FEMALE');

      if (females.length === 0) {
        return api.sendMessage("😔 There are no girls in the group.", event.threadID);
      }

      let nameList = females.map((girl, index) => `• ${index + 1}. ${girl.name}`).join("\n");

      // 
      const avatarSize = 100;
      const spacing = 10;
      const totalWidth = females.length * (avatarSize + spacing) + spacing;
      const canvas = createCanvas(totalWidth, avatarSize + 20);
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 
      for (let i = 0; i < females.length; i++) {
        const userID = females[i].id;
        const url = `https://graph.facebook.com/${userID}/picture?width=${avatarSize}&height=${avatarSize}`;
        try {
          const img = await loadImage(url);
          ctx.drawImage(img, spacing + i * (avatarSize + spacing), 10, avatarSize, avatarSize);
        } catch (e) {
          console.error(`Failed to load image for userID ${userID}`);
        }
      }

      const buffer = canvas.toBuffer('image/png');
      const imagePath = path.join(__dirname, 'girl_banner.png');
      fs.writeFileSync(imagePath, buffer);

      const message = `✨  List of all the girls in the group ✨\n\n${nameList}`;
      api.sendMessage({
        body: message,
        attachment: fs.createReadStream(imagePath)
      }, event.threadID, () => fs.unlinkSync(imagePath));

    } catch (error) {
      console.error(error);
      api.sendMessage("❌ Girls have trouble getting information.", event.threadID);
    }
  }
};
