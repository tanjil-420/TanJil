const fs = require("fs-extra");
const axios = require("axios");
const moment = require("moment-timezone");

const baseApiUrl = async () => {
  const base = await axios.get('https://raw.githubusercontent.com/nazrul4x/Noobs/main/Apis.json');
  return base.data.dipto;
};

module.exports = {
  config: {
    name: "baby",
    version: "1.6.9",
    author: "Nazrul", // don't change author
    countDown: 5,
    role: 0,
    usePrefix: true,
    isPremium: false,
    shortDescription: "Charming and Stylish Bot",
    description: "fun with bot",
    category: "fun",
    guide: {
      en: "use Bot & bby or Baby",
    },
  },

  onStart: async function () {
    console.log("✨ The bot is online and ready to charm you!");
  },

  onChat: async function ({ api, event, args, Threads, usersData }) {
    const { threadID, messageID, senderID, body } = event;
    if (!body) return;

    const uid = senderID;
    const data = await usersData.get(senderID);
    const name = data?.name || "Darling";
    const time = moment.tz("Asia/Dhaka").format("hh:mm:ss A");

    const mentions = [{ id: senderID, tag: name }];
    const messages = ["Hea Jan bolo 😩❤️‍🩹","Tumi ki Amar Sathe Kotha bolte chaw 🫵🏻🥺","Jan Ami akhon ghumabo 😑","Aso amra prem Kori 🤒💦"];

    const currentHour = moment.tz("Asia/Dhaka").hour();
    let greeting;

    if (currentHour < 12) {
      greeting = `Good Morning, Hello ${name}!`;
    } else if (currentHour < 18) {
      greeting = `Good Evening, Hello ${name}!`;
    } else {
      greeting = `Good Night, Hello ${name}!`;
    }

    const nazruls = body.toLowerCase();
    if (
      nazruls.startsWith("bot") ||
      nazruls.startsWith("bby") ||
      nazruls.startsWith("baby") ||
      nazruls.startsWith("বট") ||
      nazruls.startsWith("robot") ||
      nazruls.startsWith("bbe")
    ) {
      const userInput = body.trim();
      const isQuestion = userInput.split(" ").length > 1;

      if (isQuestion) {
        const question = userInput.slice(userInput.indexOf(" ") + 1).trim();
        try {
          const response = await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(question)}&senderID=${uid}&font=0`);
          const replyMsg = response.data.reply;

          return api.sendMessage(replyMsg, threadID, (error, info) => {
            if (!error) {
              global.GoatBot.onReply.set(info.messageID, {
                commandName: this.config.name,
                type: "reply",
                author: senderID,
              });
            }
          }, messageID);
        } catch (error) {
          console.error("error:", error);
          return api.sendMessage("😞 error bby", threadID, messageID);
        }
      } else {
        const randMessage = messages[Math.floor(Math.random() * messages.length)];
        const msg = `${randMessage}\n`;

        return api.sendMessage({ body: msg, mentions: [{ id: uid, tag: name }] }, threadID, (error, info) => {
          if (!error) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              type: "reply",
              author: senderID,
            });
          }
        }, messageID);
      }
    }
  },

  onReply: async function ({ api, event, args }) {
    if (event.type !== "message_reply") return;
    const nazrul = args.join(" ");
    const uid = event.senderID;

    try {
      const response = await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(nazrul)}&senderID=${uid}&font=0`);
      const replyMsg = response.data.reply;

      return api.sendMessage(replyMsg, event.threadID, (error, info) => {
        if (!error) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "reply",
            author: event.senderID,
          });
        }
      }, event.messageID);
    } catch (error) {
      console.error("error:", error);
      return api.sendMessage("😞 error bby", event.threadID, event.messageID);
    }
  }
};
