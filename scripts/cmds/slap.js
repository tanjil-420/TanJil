const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "slap",
    version: "1.2",
    author: "NTKhang (modified by TanJil)",
    countDown: 5,
    role: 0,
    shortDescription: "Batslap image",
    longDescription: "Batslap image",
    category: "funny",
    guide: {
      en: "   {pn} @mention | {pn} <uid> | {pn} <reply>"
    }
  },

  langs: {
    vi: {
      noTag: "Bạn phải tag người bạn muốn tát"
    },
    en: {
      noTag: "You must tag the person you want to slap"
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
    const uid1 = event.senderID;
    let uid2;

    // --- Mention check
    const mention = Object.keys(event.mentions);
    if (mention.length > 0) {
      uid2 = mention[0];
    }
    // --- Reply check
    else if (event.messageReply) {
      uid2 = event.messageReply.senderID;
    }
    // --- UID check
    else if (args && args[0]) {
      uid2 = args[0].replace(/[^0-9]/g, "");
    }

    if (!uid2) return message.reply(getLang("noTag"));

    // Restriction check
    if (uid2 === "100078140834638") {
      return message.reply("Slap yourself Dude 🐸🐸!");
    }

    try {
      const avatarURL1 = await usersData.getAvatarUrl(uid1);
      const avatarURL2 = await usersData.getAvatarUrl(uid2);

      const img = await new DIG.Batslap().getImage(avatarURL1, avatarURL2);
      const pathSave = `${__dirname}/tmp/${uid1}_${uid2}_Batslap.png`;

      fs.writeFileSync(pathSave, Buffer.from(img));

      const content = args.join(" ").replace(uid2, "");
      message.reply({
        body: content || "Bópppp 😵‍💫😵",
        attachment: fs.createReadStream(pathSave)
      }, () => fs.unlinkSync(pathSave));
    } catch (err) {
      console.error("Error in slap command:", err);
      message.reply("There was an error creating the slap image.");
    }
  }
};
