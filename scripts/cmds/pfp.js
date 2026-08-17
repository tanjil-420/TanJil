const { findUid } = global.utils;
const https = require('https');

module.exports = {
  config: {
    name: "profile",
    aliases: ["pfp", "pp"],
    version: "1.2",
    author: "Nazrul",
    countDown: 5,
    role: 0,
    description: "PROFILE image",
    category: "image",
    guide: { en: "{pn} @tag | userID | reply | Facebook URL" }
  },

  onStart: async function ({ event, message, usersData, args, api }) {
    const regExCheckURL = /^(http|https):\/\/(www\.)?facebook\.com\/[^ "]+$/;
    const ACCESS_TOKEN = "6628568379|c1e620fa708a1d5696fb991c1bde5662";

    const getUID = async () => {
      if (event.messageReply) return event.messageReply.senderID.toString();
      if (event.mentions && Object.keys(event.mentions).length > 0) return Object.keys(event.mentions)[0];
      if (args[0] && /^\d+$/.test(args[0])) return args[0];
      if (args[0] && regExCheckURL.test(args[0])) {
        if (api?.getUID) return await api.getUID(args[0]);
        return await findUid(args[0]);
      }
      return event.senderID.toString();
    };

    const getProfilePictureUrl = (uid) => {
      return new Promise((resolve, reject) => {
        const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=${ACCESS_TOKEN}`;
        const options = {
          method: 'HEAD',
          followRedirect: false
        };

        const req = https.request(url, options, (res) => {
          const ppUrl = res.headers.location || url;
          resolve(ppUrl);
        });

        req.on('error', (err) => {
          reject(err);
        });

        req.end();
      });
    };

    try {
      const uid = await getUID();
      
      let avatarUrl;
      try {
        avatarUrl = await getProfilePictureUrl(uid);
      } catch (error) {
        avatarUrl = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=${ACCESS_TOKEN}`;
      }

      const avatarStream = await global.utils.getStreamFromURL(avatarUrl);
      
      if (avatarStream) {
        message.reply({ attachment: avatarStream });
      } else {
        const fallbackAvatar = await usersData.getAvatarUrl(event.senderID);
        if (fallbackAvatar) {
          const fallbackStream = await global.utils.getStreamFromURL(fallbackAvatar);
          message.reply({ attachment: fallbackStream });
        }
      }
    } catch (e) {
      message.reply("Error fetching profile picture");
    }
  }
};