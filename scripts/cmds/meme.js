const axios = require("axios");

module.exports = {
  config: {
    name: "meme",
    author: "T A N J I L 🎀",
    countdown: 5,
    role: 0,
    description: "Get random meme from API",
    category: "fun"
  },

  onStart: async function ({ message }) {
    try {
      // Use the JSON endpoint
      const apiUrl = "https://meme-s.onrender.com/json";
      const res = await axios.get(apiUrl);

      const memes = res.data;
      if (!memes || memes.length === 0) {
        return message.reply("No memes found 💔");
      }

      const randomMeme = memes[Math.floor(Math.random() * memes.length)];
      message.reply({
        body: "Here’s your meme 🎀",
        attachment: await global.utils.getStreamFromURL(randomMeme)
      });
    } catch (err) {
      console.error(err);
      message.reply("API not responding 💔");
    }
  }
};
