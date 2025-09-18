const axios = require("axios");
const fs = require("fs-extra");
const Jimp = require("jimp");

module.exports = {
  config: {
    name: "mj",
    version: "4.1",
    role: 0,
    author: "T A N J I L 🎀",
    description: "Generate AI image in 4-grid layout with react & reply support",
    category: "user",
    usages: "poli <text>",
    cooldowns: 2,
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");

    if (!query) {
      return api.sendMessage("❌ Please provide a prompt to generate images.", threadID, messageID);
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);
    const tempMsg = await api.sendMessage("⏳ Generating images, please wait...", threadID);

    const prompt = encodeURIComponent(query);
    const imagePaths = [];

    try {
      for (let i = 0; i < 4; i++) {
        const finalPrompt = `${prompt}%20version%20${Math.floor(Math.random() * 10000)}`;
        const url = `https://image.pollinations.ai/prompt/${finalPrompt}`;
        const path = __dirname + `/cache/poli_${i}.jpg`;

        const res = await axios.get(url, { responseType: "arraybuffer", timeout: 10000 });
        if (!res.data || res.data.length < 10000) throw new Error("Empty image data");

        fs.writeFileSync(path, res.data);
        imagePaths.push(path);

        // Add delay between requests (200ms)
        await new Promise(res => setTimeout(res, 200));
      }

      // Load images
      const images = await Promise.all(imagePaths.map(p => Jimp.read(p)));
      const width = images[0].bitmap.width;
      const height = images[0].bitmap.height;

      const collage = new Jimp(width * 2, height * 2);
      collage.composite(images[0], 0, 0);
      collage.composite(images[1], width, 0);
      collage.composite(images[2], 0, height);
      collage.composite(images[3], width, height);

      const collagePath = __dirname + "/cache/poli_grid.jpg";
      await collage.writeAsync(collagePath);

      api.sendMessage(
        {
          body: "✅ Here's your AI-generated image grid.\n💬 Reply with 1, 2, 3 or 4 to view that image in full.",
          attachment: fs.createReadStream(collagePath)
        },
        threadID,
        (err, info) => {
          api.unsendMessage(tempMsg.messageID);
          api.setMessageReaction("✅", event.messageID, () => {}, true);

          global.imageReplies = global.imageReplies || {};
          global.imageReplies[info.messageID] = imagePaths;

          setTimeout(() => {
            imagePaths.forEach(p => fs.existsSync(p) && fs.unlinkSync(p));
            if (fs.existsSync(collagePath)) fs.unlinkSync(collagePath);
            delete global.imageReplies[info.messageID];
          }, 5 * 60 * 1000);
        },
        tempMsg.messageID
      );
    } catch (err) {
      console.error("❌ Error:", err.message);
      api.unsendMessage(tempMsg.messageID);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return api.sendMessage("❌ Failed to generate image. Please try again later.", threadID, messageID);
    }
  },

  onReply: async function ({ api, event }) {
    const { threadID, messageID, body, messageReply } = event;
    const replyTo = messageReply?.messageID;

    if (!global.imageReplies || !global.imageReplies[replyTo]) return;

    const index = parseInt(body.trim());
    if (isNaN(index) || index < 1 || index > 4) {
      return api.sendMessage("❌ Reply with number 1, 2, 3, or 4.", threadID, messageID);
    }

    const imgPath = global.imageReplies[replyTo][index - 1];
    api.sendMessage(
      {
        body: `📸 Here's image number ${index}`,
        attachment: fs.createReadStream(imgPath)
      },
      threadID,
      messageID
    );
  }
};
