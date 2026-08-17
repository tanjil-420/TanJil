const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "group",
    aliases: ["gc"],
    version: "2.0",
    author: "T A N J I L 🎀",
    role: 0,
    category: "Group",
    description: {
      en: "Comprehensive group management system (info, admin, nickname, emoji, name, avatar)"
    },
    guide: {
      en: "   1. /gc info\n   2. /gc admin add/remove [mention/reply/uid]\n   3. /gc usernick add/remove [mention/reply/uid] [nickname]\n   4. /gc emoji add/remove \"[emoji]\"\n   5. /gc name add/remove [new name]\n   6. /gc avatar add/remove (reply to an image)"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const action = args[0] ? args[0].toLowerCase() : "";
      const subAction = args[1] ? args[1].toLowerCase() : "";
      const threadID = event.threadID;
      const senderID = event.senderID;

      // ==================== 1. GROUP INFO ====================
      if (action === "info" || !action) {
        const threadInfo = await api.getThreadInfo(threadID);
        const groupName = threadInfo.threadName || "Unnamed Group";
        const adminIDs = threadInfo.adminIDs.map(i => i.id);
        const admins = threadInfo.userInfo.filter(user => adminIDs.includes(user.id));
        const males = threadInfo.userInfo.filter(u => u.gender === 'MALE').length;
        const females = threadInfo.userInfo.filter(u => u.gender === 'FEMALE').length;
        const totalMembers = threadInfo.participantIDs.length;
        const totalMessages = threadInfo.messageCount || "Unknown";
        const groupEmoji = threadInfo.emoji || "None";
        const groupImage = threadInfo.imageSrc;
        const approvalMode = threadInfo.approvalMode ? "Active" : "Inactive";

        let adminList = admins.map(ad => `• ${ad.name}`).join("\n┃ ");

        const msg = 
`╭━━━━━━━━━━━━━━━━━━━━╮
┃          ✨ 𝐆𝐑𝐎𝐔𝐏 𝐈𝐍𝐅𝐎 ✨
┃  
┃ 📌 Name : ${groupName} 
┃ 🆔 TID  : ${threadID}
┃ 👥 Total Members : ${totalMembers}
┃ 💬 Total Messages: ${totalMessages}
┃
┃ 🙋🏻‍♂️ Males   : ${males}
┃ 🙋🏼‍♀️ Females : ${females}
┃
┃ 😃 Emoji       : ${groupEmoji}
┃ ✅ Approval    : ${approvalMode}
┃ 
┃ 👑 ADMINS:
┃ ${adminList}
╰━━━━━━━━━━━━━━━━━━━━╯
- Dev by TanJil.4x`;

        if (groupImage) {
          const tempPath = path.join(__dirname, `cache_gc_${Date.now()}.png`);
          const res = await axios.get(groupImage, { responseType: "arraybuffer" });
          await fs.writeFile(tempPath, Buffer.from(res.data));

          return api.sendMessage({
            body: msg,
            attachment: fs.createReadStream(tempPath)
          }, threadID, () => {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
          }, event.messageID);
        } else {
          return api.sendMessage(msg, threadID, event.messageID);
        }
      }

      // Helper function to extract Target UID
      const getTargetID = () => {
        if (event.messageReply) return event.messageReply.senderID;
        if (Object.keys(event.mentions || {}).length > 0) return Object.keys(event.mentions)[0];
        if (args[2] && !isNaN(args[2])) return args[2];
        return null;
      };

      // ==================== 2. ADMIN MANAGEMENT ====================
      if (action === "admin") {
        if (subAction !== "add" && subAction !== "remove") {
          return api.sendMessage("❌ Usage: /gc admin add [mention/reply/uid] or /gc admin remove [mention/reply/uid]", threadID, event.messageID);
        }

        const targetUID = getTargetID();
        if (!targetUID) {
          return api.sendMessage("❌ Please mention, reply to a message, or provide a valid UID.", threadID, event.messageID);
        }

        const threadInfo = await api.getThreadInfo(threadID);
        const isBotAdmin = threadInfo.adminIDs.some(ad => ad.id === api.getCurrentUserID());

        if (!isBotAdmin) {
          return api.sendMessage("❌ Failed. Make sure the bot is an admin in this group.", threadID, event.messageID);
        }

        const makeAdmin = subAction === "add";
        await api.changeAdminStatus(threadID, targetUID, makeAdmin);
        return api.sendMessage(`✅ Successfully ${makeAdmin ? "promoted to" : "removed from"} group admin.`, threadID, event.messageID);
      }

      // ==================== 3. USER NICKNAME ====================
      if (action === "usernick" || action === "nick") {
        if (subAction !== "add" && subAction !== "remove") {
          return api.sendMessage("❌ Usage: /gc usernick add [mention/reply/uid] [nickname] or /gc usernick remove [mention/reply/uid]", threadID, event.messageID);
        }

        const targetUID = getTargetID();
        if (!targetUID) {
          return api.sendMessage("❌ Please mention, reply, or provide a valid user UID.", threadID, event.messageID);
        }

        if (subAction === "remove") {
          await api.changeNickname("", threadID, targetUID);
          return api.sendMessage("✅ Successfully removed user nickname.", threadID, event.messageID);
        }

        // Extract nickname (args from index 3 onwards)
        const nickname = args.slice(3).join(" ");
        if (!nickname) {
          return api.sendMessage("❌ Please provide a nickname to set.", threadID, event.messageID);
        }

        await api.changeNickname(nickname, threadID, targetUID);
        return api.sendMessage(`✅ Successfully set nickname to: "${nickname}"`, threadID, event.messageID);
      }

      // ==================== 4. GROUP EMOJI ====================
      if (action === "emoji") {
        if (subAction !== "add" && subAction !== "remove") {
          return api.sendMessage("❌ Usage: /gc emoji add \"[emoji]\" or /gc emoji remove", threadID, event.messageID);
        }

        if (subAction === "remove") {
          await api.changeGroupEmoji("", threadID);
          return api.sendMessage("✅ Successfully removed group emoji.", threadID, event.messageID);
        }

        // Reconstruct full text to find emoji inside quotes
        const fullText = args.slice(1).join(" ");
        const match = fullText.match(/"([^"]+)"/);
        const emoji = match ? match[1] : args[2];

        if (!emoji) {
          return api.sendMessage("❌ Please provide an emoji inside double quotes, e.g., /gc emoji add \"🔥\"", threadID, event.messageID);
        }

        await api.changeGroupEmoji(emoji, threadID);
        return api.sendMessage(`✅ Successfully changed group emoji to: ${emoji}`, threadID, event.messageID);
      }

      // ==================== 5. GROUP NAME ====================
      if (action === "name") {
        if (subAction !== "add" && subAction !== "remove") {
          return api.sendMessage("❌ Usage: /gc name add [new group name] or /gc name remove", threadID, event.messageID);
        }

        if (subAction === "remove") {
          await api.setTitle("", threadID);
          return api.sendMessage("✅ Group name cleared.", threadID, event.messageID);
        }

        const newName = args.slice(2).join(" ");
        if (!newName) {
          return api.sendMessage("❌ Please provide a new group name.", threadID, event.messageID);
        }

        await api.setTitle(newName, threadID);
        return api.sendMessage(`✅ Successfully changed group name to: "${newName}"`, threadID, event.messageID);
      }

      // ==================== 6. GROUP AVATAR ====================
      if (action === "avatar") {
        if (subAction !== "add" && subAction !== "remove") {
          return api.sendMessage("❌ Usage: /gc avatar add (reply to an image) or /gc avatar remove", threadID, event.messageID);
        }

        if (subAction === "remove") {
          return api.sendMessage("⚠️ Clearing group photo is not supported directly via API.", threadID, event.messageID);
        }

        if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
          return api.sendMessage("❌ Please reply to an image to set it as the group avatar.", threadID, event.messageID);
        }

        const attachment = event.messageReply.attachments[0];
        if (attachment.type !== "photo") {
          return api.sendMessage("❌ The replied message must contain a valid image.", threadID, event.messageID);
        }

        const imageUrl = attachment.url;
        const tempPath = path.join(__dirname, `cache_avatar_${Date.now()}.jpg`);
        const res = await axios.get(imageUrl, { responseType: "arraybuffer" });
        await fs.writeFile(tempPath, Buffer.from(res.data));

        await api.changeGroupImage(fs.createReadStream(tempPath), threadID, () => {
          if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        });

        return api.sendMessage("✅ Successfully updated group avatar!", threadID, event.messageID);
      }

      return api.sendMessage("❌ Invalid subcommand. Type /gc info for usage guide.", threadID, event.messageID);

    } catch (err) {
      console.error("Group Command Error:", err);
      return api.sendMessage(`❌ Error: ${err.message}`, event.threadID, event.messageID);
    }
  },

  onChat: async function () {}
};
    
