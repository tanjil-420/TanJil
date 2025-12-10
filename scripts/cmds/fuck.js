const fs = require("fs-extra");
const axios = require("axios");
const Canvas = require("canvas");
const path = require("path");

module.exports = {
  config: {
    name: "fuck",
    aliases: ["fk"],
    version: "1.0",
    author: "Efat ( modified by TanJil )",
    countDown: 5,
    role: 2,
    shortDescription: "FK with custom image",
    longDescription: "Generate a fk image with the mentioned user using a custom background. Male on right, female on left.",
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

    const senderID = event.senderID;
    const mentionedID = target;

    try {
      // Detect gender (fallback to male/female)
      const senderData = await usersData.get(senderID);
      const mentionedData = await usersData.get(mentionedID);

      const senderGender = senderData.gender || "male";
      const mentionedGender = mentionedData.gender || "female";

      let maleID, femaleID;

      if (senderGender === "male") {
        maleID = senderID;
        femaleID = mentionedID;
      } else {
        maleID = mentionedID;
        femaleID = senderID;
      }

      // Fetch avatars
      const avatarMale = await usersData.getAvatarUrl(maleID);
      const avatarFemale = await usersData.getAvatarUrl(femaleID);

      const [avatarImgMale, avatarImgFemale] = await Promise.all([
        Canvas.loadImage(avatarMale),
        Canvas.loadImage(avatarFemale)
      ]);

      // Load background image
      const bgUrl = "https://files.catbox.moe/0d5987.mp4";
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
      const avatarSize = 230;
      const y = canvasHeight / 2 - avatarSize - 90;

      // Draw female avatar (left)
      ctx.save();
      ctx.beginPath();
      ctx.arc(100 + avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImgFemale, 100, y, avatarSize, avatarSize);
      ctx.restore();

      // Draw male avatar (right)
      ctx.save();
      ctx.beginPath();
      ctx.arc(canvasWidth - 150 - avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImgMale, canvasWidth - 150 - avatarSize, y, avatarSize, avatarSize);
      ctx.restore();

      // Save and send image
      const imgPath = path.join(__dirname, "tmp", `${maleID}_${femaleID}_fk.png`);
      await fs.ensureDir(path.dirname(imgPath));
      fs.writeFileSync(imgPath, canvas.toBuffer("image/png"));

      message.reply({
        body: "Fuck 🤭💦",
        attachment: fs.createReadStream(imgPath)
      }, () => fs.unlinkSync(imgPath));

    } catch (err) {
      console.error("Error in fk command:", err);
      message.reply("There was an error creating the fk image.");
    }
  }
};
