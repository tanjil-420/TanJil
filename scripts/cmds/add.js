module.exports = {
  config: {
    name: "add",
    aliases: ["addu"],
    version: "1.0",
    author: "Mahix",
    countDown: 2,
    role: 1,
    shortDescription: "Add anyone to group",
    longDescription: "Add someone to the group by replying to their message or using UID.",
    category: "group",
    guide: "Reply to a message or use: {pn} [uid]"
  },

  onStart: async function ({ api, event, args }) {
    const threadID = event.threadID;
    let targetUID;

    if (args[0]) {
      targetUID = args[0];
    } else if (event.messageReply) {
      targetUID = event.messageReply.senderID;
    } else {
      return api.sendMessage("⚠️ Please reply to a message or provide a UID.", threadID);
    }

    try {
      await api.addUserToGroup(targetUID, threadID);
      api.sendMessage(`✅ Added UID: ${targetUID} to the group!`, threadID);
    } catch (err) {
      api.sendMessage(`❌ Failed to add user: ${err.message}`, threadID);
    }
  }
};
