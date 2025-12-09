const apiUrl = "https://www.noobs-apis.run.place";

module.exports = {
  config: {
    name: "prompt",
    aliases: ["p"],
    version: "1.6.9",
    author: "Nazrul",
    role: 0,
    description: "Get prompt from image!",
    category: "ai",
    countDown: 9,
    guide: {
      en: "{pn} [url or reply image] [optional prompt]"
    }
  },

  onStart: async ({ message, event, args }) => {
    let imgUrl;
    let prompt = "";

    const isReplyImage = event.messageReply?.attachments?.[0]?.type === "photo";

    if (isReplyImage) {
      imgUrl = event.messageReply.attachments[0].url;
      prompt = args.join(" ");
    } else if (args[0]) {
      imgUrl = args[0];
      prompt = args.slice(1).join(" ");
    }

    if (!imgUrl) return message.reply("• Reply to an image or provide an image URL!");

    message.reaction('⏳', event.messageID);

    try {
      const axios = require("axios");
      const res = await axios.get(`${apiUrl}/nazrul/promptAi?imgUrl=${encodeURIComponent(imgUrl)}&prompt=${encodeURIComponent(prompt)}`);
      message.reaction('🪶', event.messageID);
      message.reply({ body: res.data.text });
    } catch (err) {
      message.reaction('❌', event.messageID);
      message.reply("❌ Error: " + err.message);
    }
  }
};
