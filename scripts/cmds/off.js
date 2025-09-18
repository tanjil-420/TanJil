module.exports = {
  config: {
    name: "off",
    version: "1.0.0",
    author: "T A N J I L 🎀",
    countDown: 45,
    role: 2,
    shortDescription: "Turn off bot",
    longDescription: "Turn off bot",
    category: "owner",
    guide: "{p}{n}"
  },
  onStart: async function ({ event, api }) {
    api.sendMessage(
      "───────────────\n" +
      " ✅ The Bot has been turned OFF successfully\n" +
      "───────────────",
      event.threadID,
      () => process.exit(0)
    );
  }
};
