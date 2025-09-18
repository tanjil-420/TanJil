module.exports = {
  config: {
    name: "gcadmin",
    aliases: [],
    version: "1.0",
    author: "〲T A N J I L ツ",
    role: 1, // Bot admin or group admin
    shortDescription: {
      en: "Make or remove someone as admin"
    },
    longDescription: {
      en: "Only the owner, bot admin or group admin can make or remove someone as admin"
    },
    category: "Group",
    guide: {
      en: "/gcadmin add [mention/reply/uid] or /gcadmin remove [mention/reply/uid]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const ownerUID = "61576622066727"; // Owner's UID
    const senderID = event.senderID;

    // Get thread info to check admin status
    const threadInfo = await api.getThreadInfo(event.threadID);

    // Check if the sender is a group admin
    const isGroupAdmin = threadInfo.adminIDs.some(ad => ad.id === senderID);
    
    // Check if the bot is a group admin
    const isBotAdmin = threadInfo.adminIDs.some(ad => ad.id === api.getCurrentUserID());

    // If the sender is not the owner, a group admin, or a bot admin
    if (senderID !== ownerUID && !isGroupAdmin && !isBotAdmin) {
      return api.sendMessage("❌ You are not authorized to use this command.", event.threadID);
    }

    // Check if the command is "add" or "remove"
    const action = args[0];
    if (action !== "add" && action !== "remove") {
      return api.sendMessage("❌ Invalid command. Use: /gcadmin add [mention/reply/uid] or /gcadmin remove [mention/reply/uid]", event.threadID);
    }

    let uid;

    // If the message is a reply, get the sender's UID
    if (event.messageReply) {
      uid = event.messageReply.senderID;
    } 
    // If a mention is present, get the first mentioned UID
    else if (Object.keys(event.mentions).length > 0) {
      uid = Object.keys(event.mentions)[0];
    } 
    // If a UID is provided in the command, use it
    else if (args[1]) {
      uid = args[1];
    } 
    // If no valid input is provided, return an error message
    else {
      return api.sendMessage("❌ Please mention, reply to a message, or provide a UID to make someone an admin.", event.threadID);
    }

    try {
      if (action === "add") {
        // Attempt to make the user an admin
        await api.changeAdminStatus(event.threadID, uid, true);
        api.sendMessage("✅ Successfully made admin.", event.threadID);
      } else if (action === "remove") {
        // Attempt to remove the user from admin
        await api.changeAdminStatus(event.threadID, uid, false);
        api.sendMessage("✅ Successfully removed admin status.", event.threadID);
      }
    } catch (err) {
      // Handle errors, e.g., if the bot is not an admin or other issues
      api.sendMessage("❌ Failed. Make sure the bot is an admin in the group.", event.threadID);
    }
  }
};
