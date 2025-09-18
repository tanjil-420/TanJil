const replies = [
  "𝐀𝐦𝐚𝐫 𝐁𝐨𝐬𝐬 𝐓𝐚𝐧𝐉𝐢𝐥 𝐁𝐮𝐬𝐲 𝐚𝐬𝐞 😒","𝐓𝐮𝐢 𝐤𝐢 𝐓𝐚𝐧𝐉𝐢𝐥 𝐞𝐫 𝐆𝐅 𝐡𝐨𝐛𝐢 😀","𝐆𝐅 𝐡𝐨𝐭𝐞 𝐜𝐡𝐚𝐢𝐥𝐞 𝐦𝐞𝐧𝐭𝐢𝐨𝐧 𝐝𝐢𝐛𝐢 😷"," 𝐒𝐮𝐝𝐡𝐮 𝐬𝐮𝐝𝐡𝐮 𝐝𝐢𝐬𝐭𝐮𝐫𝐛 𝐤𝐨𝐫𝐢𝐬𝐡 𝐧𝐚","𝐓𝐮𝐢 𝐤𝐢 𝐓𝐚𝐧𝐉𝐢𝐥 𝐞𝐫 𝐆𝐅"
];

module.exports = {
  config: {
    name: "tom",
    version: "1.0.0",
    author: "T A N J I L 🎀",
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
    const targetUID = "61579509758592";

    // Check if exactly one user is mentioned, and it's the target UID
    if (mentionList.length === 1 && mentionList[0][0] === targetUID) {
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      return api.sendMessage(randomReply, event.threadID, event.messageID);
    }
  }
};
