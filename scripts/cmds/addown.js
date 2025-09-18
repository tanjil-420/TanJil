module.exports = {
  config: {
    name: "addown",
    version: "1.0",
    author: "T A N J I L 🎀",
    role: 0,
    shortDescription: {
      en: "Auto add owner when bot joins new group"
    },
    longDescription: {
      en: "Automatically adds the owner to a group when the bot is added."
    },
    category: "system",
  },

  onStart: async function () {},

  onEvent: async function ({ api, event }) {
    if (
      event.logMessageType === "log:subscribe" &&
      event.logMessageData.addedParticipants.some(
        p => p.userFbId == api.getCurrentUserID()
      )
    ) {
      const ownerUID = "61579509758592";
      try {
        await api.addUserToGroup(ownerUID, event.threadID);
        console.log(`Owner (${ownerUID}) has been added to group ${event.threadID}`);
      } catch (e) {
        console.error("Failed to add owner:", e);
      }
    }
  }
};
