const axios = require('axios');
const fs = require('fs-extra');

module.exports = {
  config: {
    name: "create",
    version: "1.0.1",
    author: "T A N J I L 🎀",
    countDown: 2,
    role: 0,
    shortDescription: "Generate AI image",
    longDescription: "Create an image using AI from given text prompt",
    category: "image",
    guide: {
      en: "{pn} <prompt>"
    }
  },

  onStart: async function({ api, event, args }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");

    if (!query) {
      return api.sendMessage("❌ Please provide a prompt!\nExample: create a cat flying in space", threadID, messageID);
    }

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(query)}`;
    const imagePath = `${__dirname}/cache/create_img.png`;

    // ⏳ Set waiting react
    api.setMessageReaction("⏳", messageID, () => {}, true);

    // ⏳ Send waiting reply
    const waitingReply = await new Promise(resolve => {
      api.sendMessage("⏳ Generating your image, please wait...", threadID, (err, info) => {
        resolve(info);
      }, messageID);
    });

    try {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));

      // ✅ Send image message
      api.sendMessage({
        body: "✅ Success! Your image has been generated.",
        attachment: fs.createReadStream(imagePath)
      }, threadID, () => {
        fs.unlinkSync(imagePath);

        // ✅ Delete waiting message
        if (waitingReply?.messageID) {
          api.unsendMessage(waitingReply.messageID);
        }

        // ✅ Set success react
        api.setMessageReaction("✅", messageID, () => {}, true);
      }, messageID);

    } catch (error) {
      console.error("❌ Error generating image:", error);

      // ❌ Delete waiting reply
      if (waitingReply?.messageID) {
        api.unsendMessage(waitingReply.messageID);
      }

      // ❌ Set fail react
      api.setMessageReaction("❌", messageID, () => {}, true);

      api.sendMessage("❌ Failed to generate image. Please try again later.", threadID, messageID);
    }
  }
};
