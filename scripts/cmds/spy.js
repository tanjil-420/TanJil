const axios = require("axios");
const https = require('https');
const { findUid } = global.utils;

module.exports = {
  config: {
    name: "spy",
    aliases: ["userinfo", "information", "stalk"],
    version: "1.6.9",
    role: 0,
    author: "Nazrul",
    usePrefix: true,
    shortDescription: "Get user information",
    longDescription: "Get user all information",
    category: "user",
    countDown: 5
  },

  onStart: async function ({ event, message, usersData, api, args }) {
    message.reaction("⏳", event.messageID);

    try {
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

      const uid = await getUID();
      
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

      const userInfo = await api.getUserInfo(uid);
      const uInfo = await usersData.get(uid);
      const apiUrl = "https://www.noobs-apis.run.place";
      const profileUrl = userInfo[uid].profileUrl;

      const config = global.GoatBot?.config || {};
      const adminUsers = Array.isArray(config.adminBot) ? config.adminBot : [];
      const premiumUsers = Array.isArray(config.users) ? config.users : [];
      
      const isAdminFromConfig = adminUsers.includes(uid);
      const isPremiumFromConfig = premiumUsers.includes(uid);
      
      const isAdmin = isAdminFromConfig || (uInfo?.admin?.isAdmin === true);
      const isPremium = isPremiumFromConfig || (uInfo?.premium?.isPremium === true);

      let coverPhotoUrl = null;
      try {
        const coverResponse = await axios.get(`${apiUrl}/nazrul/fbcover?url=${profileUrl}`);
        if (coverResponse.data && coverResponse.data.photos && coverResponse.data.photos[1]) {
          const coverData = coverResponse.data.photos[1];
          if (coverData && !coverData.endsWith(".gif")) {
            coverPhotoUrl = coverData;
          }
        }
      } catch (error) {
        console.log("Cover photo fetch failed, using profile only");
      }

      const genderText = userInfo[uid].gender === 1 ? "👧 Girl" : userInfo[uid].gender === 2 ? "👦 Boy" : "🌈 Other";
      const money = uInfo?.money || 0;
      const allUser = await usersData.getAll();
      
      const sortedByExp = Array.isArray(allUser) ? allUser.slice().sort((a, b) => (b.exp || 0) - (a.exp || 0)) : [];
      const sortedByMoney = Array.isArray(allUser) ? allUser.slice().sort((a, b) => (b.money || 0) - (a.money || 0)) : [];
      
      const rank = sortedByExp.findIndex(u => u.userID === uid) + 1;
      const moneyRank = sortedByMoney.findIndex(u => u.userID === uid) + 1;
      const position = userInfo[uid].type;

      const userInformation = `
╭─────【 User Information 】─────
│
🎀 • Name: ${userInfo[uid].name}
🗣️ • Nickname: ${userInfo[uid].alternateName}
🌟 • Gender: ${genderText}
🆔 • UID: ${uid}
🎓 • Class: ${position ? position.toUpperCase() : "Normal User"}
🔰 • Username: ${userInfo[uid].vanity || "None"}
🛠️ • Profile URL: ${profileUrl}
🎂 • Birthday: ${userInfo[uid].isBirthday !== false ? userInfo[uid].isBirthday : "Private"}
🤝 • Friend with Bot: ${userInfo[uid].isFriend ? "Yes" : "No"}
🪪 • Search Tokens: ${userInfo[uid].searchTokens?.join(", ") || "None"}
╰─────────────────────

╭─────【 More info 】─────
│
👑 • Premium User: ${isPremium ? "Yes" : "No"}
🛡 • isAdmin: ${isAdmin ? "Yes" : "No"}
🚫 • Spam Banned: ${uInfo?.settings?.spamBan === true ? "Yes" : "No"}
🛠️ • Protect Enabled: ${uInfo?.settings?.protect === true ? "Yes" : "No"}
🔓 • Balance bypassed: ${uInfo?.settings?.isBypassed === true ? "Yes" : "No"}
💰 • Money: $${formatMoney(money)}
🏆 • Rank: #${rank || "N/A"}/${sortedByExp.length || "N/A"}
💸 • Money Rank: #${moneyRank || "N/A"}/${sortedByMoney.length || "N/A"}
│
╰───────────────────── `;

      const safeGetStream = async (urls) => {
        for (let url of urls) {
          if (!url) continue;
          try {
            const response = await axios.head(url);
            const type = response.headers['content-type'];
            if (!type.startsWith("image/")) continue;
            return await global.utils.getStreamFromURL(url);
          } catch {}
        }
        return null;
      };

      let profilePictureUrl;
      try {
        profilePictureUrl = await getProfilePictureUrl(uid);
      } catch (error) {
        console.log("Failed to get profile picture URL with custom method, using fallback");
        profilePictureUrl = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=${ACCESS_TOKEN}`;
      }

      const avatarStream = await safeGetStream([
        profilePictureUrl,
        await usersData.getAvatarUrl(uid)
      ]);

      if (!avatarStream) {
        await message.reply("⚠️ Cannot fetch profile picture.");
        return message.reaction("❌", event.messageID);
      }

      const attachments = [avatarStream];
      
      if (coverPhotoUrl && coverPhotoUrl.startsWith("https://scontent")) {
        try {
          const coverStream = await safeGetStream([coverPhotoUrl]);
          if (coverStream) {
            attachments.push(coverStream);
          }
        } catch (error) {
          console.log("Cover photo stream failed, sending profile only");
        }
      }

      await message.reply({
        body: userInformation,
        attachment: attachments
      });

      message.reaction("✅", event.messageID);
    } catch (error) {
      console.error("Spy command error:", error);
      message.reaction("❌", event.messageID);
    }
  }
};

function formatMoney(num) {
  const units = ["", "K", "M", "B", "T", "Q", "Qi", "Sx", "Sp", "Oc", "N", "D"];
  let unit = 0;
  while (num >= 1000 && ++unit < units.length) num /= 1000;
  return num.toFixed(1).replace(/\.0$/, "") + units[unit];
}
