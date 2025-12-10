const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs");

module.exports = {
  config: {
    name: "toilet",
    aliases: ["tl"],
    version: "1.0",
    author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎( modified by TanJil )",
    countDown: 5,
    role: 0,
    shortDescription: "face on toilet",
    longDescription: "",
    category: "funny",
    guide: "{pn} @mention | {pn} <uid> | {pn} <reply>",
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

    if (!target) return message.reply("Please mention someone, provide UID, or reply to a message.");

    // 
    if (target === "100068909067279") {
      return message.reply("You deserve this, not my owner! 😙");
    }

    bal(target).then(ptth => {
      if (ptth) {
        message.reply({
          body: "You Deserve This Place 🙂✌️",
          attachment: fs.createReadStream(ptth),
        });
      } else {
        message.reply("An error occurred while processing the image.");
      }
    });
  },
};

async function bal(userID) {
  try {
    let avatar = await jimp.read(`https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
    avatar = avatar.resize(400, 400).circle();

    let img = await jimp.read("https://i.imgur.com/sZW2vlz.png");
    img.resize(1080, 1350);

    //
    img.composite(avatar, 310, 670);

    let pth = "toilet.png";
    await img.writeAsync(pth);

    return pth;
  } catch (error) {
    console.error("Error processing image:", error);
    return null;
  }
}
