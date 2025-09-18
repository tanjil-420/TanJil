module.exports = {
  config: {
    name: "spy",
    version: "4.0",
    author: "T A N J I L 🎀",
    countDown: 5,
    role: 0,
    shortDescription: "View detailed Facebook profile info",
    longDescription: "Get a full Facebook user's profile info including name, UID, username, gender, birthday, relationship status, followers count, and more.",
    category: "image",
  },

  onStart: async function ({ event, message, usersData, api, args }) {
    try {
      const uidSender = event.senderID;
      const uidMentioned = Object.keys(event.mentions)[0];
      let uid = null;

      // Extract UID from args, reply, mention, or fallback to sender
      if (args[0]) {
        if (/^\d+$/.test(args[0])) {
          uid = args[0];
        } else {
          const match = args[0].match(/(?:id=|\/)(\d{5,})/);
          if (match) uid = match[1];
        }
      }

      if (!uid) {
        uid = event.type === "message_reply"
          ? event.messageReply.senderID
          : uidMentioned || uidSender;
      }

      // Fetch Facebook user info
      const userInfo = await new Promise((resolve, reject) => {
        api.getUserInfo(uid, (err, result) => {
          if (err || !result || !result[uid]) return reject("User not found or private profile.");
          resolve(result);
        });
      });

      const user = userInfo[uid];
      const data = await usersData.get(uid);
      const avatarUrl = await usersData.getAvatarUrl(uid);
      const senderInfo = await usersData.get(uidSender);
      const senderName = senderInfo?.name || "User";

      // Info extraction with fallbacks
      const name = user.name || "Unknown";
      const gender = user.gender === 1 ? "Female" : user.gender === 2 ? "Male" : "Unknown";
      const birthday = user.isBirthday ? "Yes (Today)" : "Not available";
      const isFriend = user.isFriend ? "Yes" : "No";
      const profileUrl = `https://www.facebook.com/${uid}`;
      const username = user.vanity || "Not set";
      const location = user.location || "Private or Unknown";
      const relationship = user.relationship_status || "Not set";
      const followers = user.followers || "Hidden";
      const creationYear = user.created_time ? new Date(user.created_time * 1000).getFullYear() : "Unknown";

      const balance = data?.money || 0;
      const exp = data?.exp || 0;
      const level = Math.floor(0.1 * Math.sqrt(exp));

      const threadInfo = await api.getThreadInfo(event.threadID);
      const nickname = threadInfo?.nicknames?.[uid] || "Not set";

      const allUsers = await usersData.getAll();
      const sortedUsers = allUsers
        .filter(user => typeof user.money === 'number')
        .sort((a, b) => b.money - a.money);
      const userRankIndex = sortedUsers.findIndex(user => user.userID === uid);
      const rankPosition = userRankIndex !== -1 ? `#${userRankIndex + 1}` : "Unranked";

      // Final message
      const profileInfo = 
`╭─❏ 【 𝑼𝑺𝑬𝑹 𝑰𝑵𝑭𝑶 】 ❏─────
│ 🆔 Name      : ${name}
│ 🔖 UID       : ${uid}
│ 👤 Username  : ${username}
│
│ 🚻 Gender    : ${gender}
│ 🎂 Birthday  : ${birthday}
│ 💞 Relation  : single 
│
│ 🤝 Friend    : ${isFriend}
│ 🔗 Profile   : ${profileUrl}
╰─────────────────────────────⟡

╭─❏ 【 𝑴𝑶𝑹𝑬 𝑰𝑵𝑭𝑶 】 ❏─────
│ 💰 Balance   : $${balance}
│ ✨ EXP       : ${exp}
│ 🏅 Level     : ${level}
│ 📊 Rank      : ${rankPosition}
│ 🎭 Nickname  : ${nickname}
╰─────────────────────────────⟡`;

      return message.reply({
        body: profileInfo,
        attachment: await global.utils.getStreamFromURL(avatarUrl)
      });

    } catch (err) {
      console.error("SPY Command Error:", err);
      return message.reply("❌ Failed to fetch user data. The profile might be private, deactivated, or an invalid UID.");
    }
  }
};
