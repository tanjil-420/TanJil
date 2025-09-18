const axios = require("axios");


module.exports.config = {
  name: "elisa",
  aliases: ["itachi", "Itachi", "Uchiha"],
  version: "1.0.0",
  role: 0,
  author: "Anthony",
  description: "better then all Sim simi with multiple conversation",
  guide: { en: "[message]" },
  category: "ChatBots",
  coolDowns: 5,
};
module.exports.onReply = async function ({ api, event }) {
  if (event.type == "message_reply") {
    const reply = event.body
    if (isNaN(reply)) {

      const response = await axios.get(
        `http://65.109.80.126:20409/sim?ask=${encodeURIComponent(reply)}`,
      );
      const ok = response.data.respond;
      await api.sendMessage(
        ok,
        event.threadID,
        (error, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.senderID,
            link: ok,
          });
        },
        event.messageID,
      );
    }
  }
};

module.exports.onChat = async function({
  event,
  api,
  message,
  getLang
}) {
  if (event.body && ["itachi", "Itachi", "it", "uchiha"].includes(event.body.toLowerCase())) {
    const greetings = [
      "𝗜𝘁𝗮𝗰𝗵𝗶 বলে অসম্মান করচ্ছিছ,😰😿",
      "দূরে যা, তোর কোনো কাজ নাই, শুধু 𝗜𝘁𝗮𝗰𝗵𝗶 𝗜𝘁𝗮𝗰𝗵𝗶 করিস  😉😋🤣",
      "𝗛𝗲𝘆 𝗯𝗯𝘆 𝗜 𝗮𝗺 𝗵𝗲𝗿𝗲🌟",
      "𝗜 𝗮𝗺 𝗻𝗼𝘁 𝗵𝗲𝗿𝗼 𝗶 𝗮𝗺 𝘃𝗶𝗹𝗹𝗶𝗲𝗻💀👑",
      "𝗛𝗲𝘆 𝗯𝗲𝗽 𝗶𝘁𝗮𝗰𝗵𝗶 𝘂𝗰𝗵𝗶𝗵𝗮 𝗶𝘀 𝗵𝗲𝗿𝗲🌊",
      "𝗬𝗲𝘀 𝘀𝗶𝗿 𝗵𝗼𝘄 𝗰𝗮𝗻 𝗶 𝗵𝗲𝗹𝗽 𝘆𝗼𝘂??🌟🍂",
      "বলো আমার ফুলটুসি____😽💙",
      "আজও কারো হতে পারলাম নাহ___😌💙",
      "𝗛𝗲𝘆 𝗯𝗯𝘆 𝗶 𝗮𝗺 𝗶𝘁𝗮𝗰𝗵𝗶 𝗳𝗿𝗼𝗺 𝗛4𝗦𝗦𝗔1𝗡 𝘀𝗮𝗿𝘃𝗲𝗿🇧🇩🤖",
      "𝗜𝘁𝗮𝗰𝗵𝗶 বললে চাকরি থাকবে না____😰😰☠",
      "এত 𝗜𝘁𝗮𝗰𝗵𝗶 𝗜𝘁𝗮𝗰𝗵𝗶 করস কেন কি হইছে বল___😾😾🔪🔪",
      "দূরে গিয়ে মর এত 𝗜𝘁𝗮𝗰𝗵𝗶 𝗜𝘁𝗮𝗰𝗵𝗶 না করে___😾😾🔪🔪"
    ];
    const mg = greetings[Math.floor(Math.random() * greetings.length)];
    await api.sendMessage(
      { body: mg },
      event.threadID,
      (error, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          link: mg,
        });
      },
      event.messageID,
    );
  }
};

module.exports.onStart = async function ({ api, args, event }) {
  try {
  const obfuscatedAuthor = String.fromCharCode(65, 110, 116, 104, 111, 110, 121);
         if (this.config.author !== obfuscatedAuthor) {
        return api.sendMessage("You are not authorized to change the author name.\n\nPlease author fix name  to work with this cmd", event.threadID, event.messageID);
         }
    const adnan = args.join(" ")
    const msg = args.join(" ").trim();
    if (!args[0]) {
      api.sendMessage(
        "𝗣𝗹𝗲𝗮𝘀𝗲 𝘁𝘆𝗽𝗲 𝗶𝘁𝗮𝗰𝗵𝗶 𝗵𝗲𝗹𝗹𝗼 🐰",
        event.threadID,
        event.messageID,
      );
      return;
    }

    if (args[0].toLowerCase() === "teach") {
        const input = msg.slice(5).trim();
        const parts = input.split('-');

        if (parts.length === 2) {
          const question = parts[0].trim();
          const answer = parts[1].trim();

          await axios.get(`http://65.109.80.126:20409/teach?ask=${question}&ans=${answer}`)

          return api.sendMessage(
            `🎓 𝐊𝐧𝐨𝐰𝐥𝐞𝐝𝐠𝐞 𝐮𝐧𝐥𝐨𝐜𝐤𝐞𝐝! 𝐓𝐚𝐮𝐠𝐡𝐭: "${question}" — 𝐄𝐧𝐠𝐥𝐢𝐬𝐡𝐭𝐞𝐧𝐞𝐝 𝐫𝐞𝐬𝐩𝐨𝐧𝐬𝐞: "${answer}". 𝐘𝐨𝐮𝐫 𝐰𝐢𝐬𝐝𝐨𝐦 𝐬𝐡𝐢𝐧𝐞𝐬 𝐛𝐫𝐢𝐠𝐡𝐭𝐞𝐫 𝐭𝐡𝐚𝐧 𝐚 𝐬𝐮𝐩𝐞𝐫𝐧𝐨𝐯𝐚!`,
            event.threadID,
            event.messageID
          );
        } else {
          return api.sendMessage(
            "📚 𝐓𝐨 𝐬𝐡𝐚𝐫𝐞 𝐲𝐨𝐮𝐫 𝐰𝐢𝐬𝐝𝐨𝐦, 𝐮𝐬𝐞: teach [question] - [answer]. 𝐒𝐡𝐚𝐫𝐢𝐧𝐠 𝐢𝐬 𝐜𝐚𝐫𝐢𝐧𝐠!",
            event.threadID,
            event.messageID
          );
        }
      }

      if (args[0].toLowerCase() === "list") {


        try {


         const data =  await axios.get(`http://65.109.80.126:20409/info`)

          return api.sendMessage(
            `Total so many Queries and Response have been answered\n\n➠ Total Queries: ${data.data.totalKeys}\n \n➠ Total Response: ${data.data.totalResponses}`,
            event.threadID,
            event.messageID
          );
        } catch (error) {
          return api.sendMessage(
            "Somethink went wrong",
            event.threadID,
            event.messageID
          );
        }
      }

    if (adnan) {

      const response = await axios.get(
        `http://65.109.80.126:20409/sim?ask=${adnan}`,
      );
      const mg = response.data.respond;
      await api.sendMessage(
        { body: mg },
        event.threadID,
        (error, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.senderID,
            link: mg,
          });
        },
        event.messageID,
      );
    }
  } catch (error) {
    console.error(`Failed to get an answer: ${error.message}`);
    api.sendMessage(
      `${error.message}.\nAn error`,
      event.threadID,
      event.messageID,
    );
  }
};
