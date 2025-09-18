module.exports = {
  config: {
    name: "inbox",
    aliases: ["in"],
    version: "2.0",
    author: "B4YJ1D",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "okh enjoy @b4yj1d cmd"
    },
    longDescription: {
      en: ""
    },
    category: "fun",
    guide: {
      en: ""
    }
  },
  langs: {
    en: {
      gg: ""
    },
    id: {
      gg: ""
    }
  },
  onStart: async function({ api, event, args, message }) {
    try {
      const query = encodeURIComponent(args.join(' '));
      message.reply("𝐁𝐚𝐛𝐲 𝐀𝐦𝐢 𝐭𝐨𝐦𝐚𝐫 𝐢𝐧𝐛𝐨𝐱 𝐞 𝐬𝐦𝐬 𝐝𝐢𝐬𝐢 😺", event.threadID);
      api.sendMessage("✅ 𝐗𝐚𝐍 𝐓𝐮𝐦𝐢 𝐠𝐫𝐨𝐮𝐩 𝐞 𝐤𝐢 𝐤𝐨𝐫𝐨 𝐀𝐦𝐢 𝐭𝐨 𝐢𝐧𝐛𝐨𝐱 𝐭𝐨𝐦𝐚𝐫 𝐉𝐨𝐧𝐧𝐨 𝐁𝐨𝐬𝐞 𝐚𝐬𝐢 😄🙈", event.senderID);
    } catch (error) {
      console.error("Error bro: " + error);
    }
  }
}
