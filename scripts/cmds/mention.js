const replies = [
  "Amar boss ŤÅÑJÏŁ busy ase",
  "Amar boss ke Dak dibi na",
  "ŤÅÑJÏŁ er permission chara tag bondho",
  "Boss sleep ditese, disturb korish na",
  "Boss er mood baje, tag diye ki korbi?",
  "Tag dile boss rage jabe",
  "Tag korar age chinta koros?",
  "Boss ke tag dilam, tui ajke mara"
];

module.exports = {
  config: {
    name: "mentionTom",
    version: "1.0",
    author: "T A N J I L",
    shortDescription: {
      en: "Replies when specific user is mentioned",
    },
    longDescription: {
      en: "Automatically responds with random lines if a specific user is mentioned.",
    },
    category: "no prefix",
    usages: "",
    cooldowns: 3,
  },

  onStart: async function () {},

  onChat: async ({ event, api }) => {
    const mentionList = Object.entries(event.mentions || {});
    const targetUID = "61576622066727";

    // Check if exactly one user is mentioned, and it's the target UID
    if (mentionList.length === 1 && mentionList[0][0] === targetUID) {
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      return api.sendMessage(randomReply, event.threadID, event.messageID);
    }
  }
};
