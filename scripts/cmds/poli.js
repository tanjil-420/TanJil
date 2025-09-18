const axios = require('axios');
const fs = require('fs-extra');

module.exports = {
  config: {
    name: "poli",
    version: "1.1",
    role: 0,
    author: "T A N J I L 🎀",
    description: "Generate image from Pollinations AI with waiting system",
    category: "user",
    usages: "poli <text>",
    cooldowns: 2,
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");

    if (!query) {
      return api.sendMessage("❌ Please provide some text to generate image.", threadID, messageID);
    }

    const encodedQuery = encodeURIComponent(query);
    const path = __dirname + `/cache/poli.png`;

    // React to user's message with waiting emoji
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    // Send a waiting reply
    const waitingMessage = await new Promise(resolve =>
      api.sendMessage("⏳ Generating image, please wait...", threadID, (err, info) => {
        resolve(info);
      }, messageID)
    );

    try {
      const response = await axios.get(`https://image.pollinations.ai/prompt/${encodedQuery}`, {
        responseType: "arraybuffer"
      });

      fs.writeFileSync(path, response.data);

      // Send final image
      api.sendMessage(
        {
          body: "✅ Here's your generated image ✨🌸",
          attachment: fs.createReadStream(path)
        },
        threadID,
        () => {
          fs.unlinkSync(path);
          // Delete waiting reply
          if (waitingMessage?.messageID) {
            api.unsendMessage(waitingMessage.messageID);
          }
          // Change reaction to success
          api.setMessageReaction("✅", event.messageID, () => {}, true);
        },
        messageID
      );
    } catch (error) {
      console.error("❌ Error generating image:", error.message);

      // Delete waiting message
      if (waitingMessage?.messageID) {
        api.unsendMessage(waitingMessage.messageID);
      }

      // Change reaction to error
      api.setMessageReaction("❌", event.messageID, () => {}, true);

      api.sendMessage("❌ Failed to generate image. Please try again later.", threadID, messageID);
    }
  }
};
