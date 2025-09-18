const axios = require("axios");

module.exports = {
  config: {
    name: "gen",
    aliases: ["generate", "aiimage"],
    version: "1.0",
    author: "Eren",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Generate AI image" },
    longDescription: { en: "Generate AI image from prompt (direct stream)" },
    category: "ai",
    guide: { en: "{pn} [prompt]" }
  },

  onStart: async function ({ message, args }) {
    const prompt = args.join(" ");
    if (!prompt)
      return message.reply("❌ Please provide a prompt.\nExample: gen neko girl in rain");

    const url = `https://zeehao-xcos.onrender.com/mahi/poli?prompt=${encodeURIComponent(prompt)}`;

    try {
      const response = await axios.get(url, { responseType: "stream" });

      return message.reply({
        body: `🖼️ Prompt: ${prompt}`,
        attachment: response.data
      });
    } catch (err) {
      console.error(err);
      return message.reply("❌ Error: Couldn't generate image from API.");
    }
  }
};
