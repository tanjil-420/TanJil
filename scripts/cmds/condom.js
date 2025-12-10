const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs");

module.exports = {
  config: {
    name: "condom",
    aliases: ["condom"],
    version: "1.0",
    author: "Samir ( modified by TanJil )",
    countDown: 5,
    role: 0,
    shortDescription: "Make fun of your friends",
    longDescription: "Make fun of your friends using crazy condom fails",
    category: "funny",
    guide: "{pn} @mention | {pn} <uid> | {pn} <reply>"
  },

  onStart: async function ({ message, event, args }) {
    let target;

    const mention = Object.keys(event.mentions);

    if (mention.length > 0) {
      // Case 1: @mention
      target = mention[0];
    } else if (args[0] && !isNaN(args[0])) {
      // Case 2: UID
      target = args[0];
    } else if (event.messageReply) {
      // Case 3: Reply
      target = event.messageReply.senderID;
    }

    if (!target) return message.reply("You must select/tag a person or reply to their message.");

    try {
      const imagePath = await bal(target);
      await message.reply({
        body: "Ops Crazy Condom Fails😆",
        attachment: fs.createReadStream(imagePath)
      });
    } catch (error) {
      console.error("Error while running command:", error);
      await message.reply("An error occurred while processing the image.");
    }
  }
};

async function bal(one) {
  const avatarone = await jimp.read(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  const image = await jimp.read("https://i.imgur.com/cLEixM0.jpg");
  image.resize(512, 512).composite(avatarone.resize(263, 263), 256, 258);
  const imagePath = "condom.png";
  await image.writeAsync(imagePath);
  return imagePath;
}
