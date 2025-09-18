const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "imagine",
  version: "1.0.0",
  role: 0,
  author: "T A N J I L 🎀",
  description: "Generate image from Pollinations AI",
  commandCategory: "image",
  usages: "[your prompt]",
  cooldowns: 2,
};

// ✅ Add this
module.exports.onStart = async function () {
  // Optional startup logic here, or leave empty
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const query = args.join(" ");

  if (!query) {
    return api.sendMessage("❌ Please provide a prompt to generate an image.", threadID, messageID);
  }

  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(query)}`;
  const imagePath = path.join(__dirname, 'cache', 'poli.png');

  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(imagePath, response.data);

    api.sendMessage({
      body: `🖼️ 𝗜𝗺𝗮𝗴𝗲 𝗴𝗲𝗻𝗲𝗿𝗮𝘁𝗲𝗱 𝗳𝗼𝗿: “${query}”`,
      attachment: fs.createReadStream(imagePath)
    }, threadID, () => {
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Failed to delete image:", err);
      });
    }, messageID);

  } catch (error) {
    console.error("Image generation error:", error.message);
    api.sendMessage("❌ Couldn't generate the image. Try again later.", threadID, messageID);
  }
};
