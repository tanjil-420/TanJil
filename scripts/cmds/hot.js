const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "hot",
    version: "1.0.2",
    author: "T A N J I L 🎀",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Send random hot video from API"
    },
    longDescription: {
      en: "Fetch and send a random hot video using your API"
    },
    category: "18+",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message, event, api }) {
    const apiUrl = "https://hot-api-yu0b.onrender.com/video";

    try {
      // waiting react
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      // fetch video stream
      const response = await axios({
        method: "GET",
        url: apiUrl,
        responseType: "stream"
      });

      // save temp file
      const filePath = path.join(__dirname, "cache", `hot_${Date.now()}.mp4`);
      await fs.ensureDir(path.dirname(filePath));

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        await message.reply({
          body: "🔥 Here is your hot video!",
          attachment: fs.createReadStream(filePath)
        });

        // success react
        api.setMessageReaction("✅", event.messageID, () => {}, true);

        // cleanup
        fs.unlinkSync(filePath);
      });

      writer.on("error", () => {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        message.reply("Failed to download video.");
      });

    } catch (err) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      message.reply(`Error: ${err.message}`);
    }
  }
};
