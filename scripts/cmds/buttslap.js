const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "buttslap",
    version: "1.1",
    author: "Amit max ⚡( modified by TanJil )", // Amit Max don't change it..
    countDown: 5,
    role: 0,
    shortDescription: "Buttslap image",
    longDescription: "Buttslap image",
    category: "funny",
    guide: "{pn} @mention | {pn} <uid> | {pn} <reply>"
  },

  langs: {
    vi: {
      noTag: ""
    },
    en: {
      noTag: "You must tag the person you want to slap"
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
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

    if (!target) return message.reply(getLang("noTag"));

    const uid1 = event.senderID;
    const uid2 = target;
    const avatarURL1 = await usersData.getAvatarUrl(uid1);
    const avatarURL2 = await usersData.getAvatarUrl(uid2);

    const img = await new DIG.Spank().getImage(avatarURL1, avatarURL2);
    const pathSave = `${__dirname}/tmp/${uid1}_${uid2}_spank.png`;
    fs.writeFileSync(pathSave, Buffer.from(img));

    const content = args.join(' ').replace(target, "");
    message.reply({
      body: `${content || "hehe boii"}`,
      attachment: fs.createReadStream(pathSave)
    }, () => fs.unlinkSync(pathSave));
  }
};
