const fs = require("fs-extra");
const axios = require("axios");
const Canvas = require("canvas");
const path = require("path");

module.exports = {
  config: {
    name: "clown",
    aliases: ["clown"],
    version: "2.2",
    author: "TAREK( modified by TanJil )",
    countDown: 5,
    role: 0,
    shortDescription: "clown with custom image",
    longDescription: "Generate a clown image with the mentioned user using a custom background.",
    category: "funny",
    guide: "{pn} @mention | {pn} <uid> | {pn} <reply>"
  },

  onStart: async function ({ api, message, event, usersData, args }) {
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

    if (!target) return message.reply("Please mention someone, give UID, or reply to their message.");

    const mentionedID = target;

    try {
      // Get mentioned user's avatar
      const avatarUrl = await usersData.getAvatarUrl(mentionedID);
      const avatarImg = await Canvas.loadImage(avatarUrl);

      // Load background
      const bgUrl = "https://res.cloudinary.com/mahiexe/image/upload/v1748281762/mahi/1748281761683-540296611.jpg";
      const bgRes = await axios.get(bgUrl, { responseType: "arraybuffer" });
      const bg = await Canvas.loadImage(bgRes.data);

      // Canvas setup
      const canvasWidth = 900;
      const canvasHeight = 600;
      const canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext("2d");

      // Draw background
      ctx.drawImage(bg, 0, 0, canvasWidth, canvasHeight);

      // Avatar settings
      const avatarSize = 150;
      const x = 375;
      const y = 300;

      ctx.save();
      ctx.beginPath();
      ctx.arc(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, x, y, avatarSize, avatarSize);
      ctx.restore();

      // Save and send
      const imgPath = path.join(__dirname, "tmp", `${mentionedID}_clown.png`);
      await fs.ensureDir(path.dirname(imgPath));
      fs.writeFileSync(imgPath, canvas.toBuffer("image/png"));

      message.reply({
        body: "𝙼𝚢 𝚏𝚛𝚒𝚎𝚗𝚍 𝚒𝚜 𝚓𝚘𝚔𝚎𝚛 🃏",
        attachment: fs.createReadStream(imgPath)
      }, () => fs.unlinkSync(imgPath));

    } catch (err) {
      console.error("Error in clown command:", err);
      message.reply("There was an error creating the clown image.");
    }
  }
};
