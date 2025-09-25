module.exports = {
  config: {
    name: "supportgroup",
    aliases: ["sgc", "support gc", "sgroup"],
    version: "1.0.0",
    author: "T A N J I L 🎀",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Join the official support group"
    },
    longDescription: {
      en: "This command allows users to join the official support group chat quickly and easily."
    },
    category: "General",
    guide: {
      en: "{pn} - Join the support group"
    }
  },

  onStart: async function ({ api, event, threadsData, message }) {
    const supportGroupThreadID = "9861230640579491"; // Replace with your support group thread ID

    try {
      const { members } = await threadsData.get(supportGroupThreadID);

      // Check if user is already in the support group
      const isMember = members.some(
        member => member.userID === event.senderID && member.inGroup
      );

      if (isMember) {
        const alreadyInGroupMessage = `
🚫 You are already a member of the Support Group 🚫`;
        return message.reply(alreadyInGroupMessage);
      }

      // Add user to the support group
      await api.addUserToGroup(event.senderID, supportGroupThreadID);

      const successMessage = `
🎉 Welcome! You have been successfully added to the Support Group 🎉`;
      return message.reply(successMessage);
    } catch (error) {
      const failedMessage = `
❌ Unable to add you to the Support Group ❌
👉 Please send me a friend request or make sure your profile is unlocked, then try again.
      `;
      console.error("Error adding user to support group:", error);
      return message.reply(failedMessage);
    }
  }
};
