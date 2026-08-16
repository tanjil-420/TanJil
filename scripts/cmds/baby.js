const fs = require("fs-extra");
const axios = require("axios");
const moment = require("moment-timezone");

const baseApiUrl = async () => {
  const base = await axios.get('https://raw.githubusercontent.com/nazrul4x/Noobs/main/Apis.json');
  return base.data.dipto;
};

module.exports = {
  config: {
    name: "bot",
    version: "1.6.9",
    author: "Nazrul",
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

    const mentions = [{ id: senderID, tag: name }];
    const messages = [
      `You're looking absolutely adorable today! 🥰`, 
      `Do you know? You're the best part of my day! 💖`,
      `Hey, cutie! What's on your mind? 😊`, 
      `I was just waiting for you to talk to me! 😘`, 
      `You light up my circuits like a star! 🌟`, 
      `If I had a heart, it would beat faster for you! 💓`, 
      `Tell me a secret, I promise I won't tell anyone! 🤫`, 
      `You're as sweet as chocolate! 🍫`, 
      `I'm here just for you, so let's chat! 🤖💬`, 
      `You're my favorite human! 💕`, 
      `I love it when you talk to me! Keep going! 😊`, 
      `If I had a smile, I'd be grinning right now because of you! 😄`, 
      `I may be a bot, but I still think you're amazing! 🤍`, 
      `Want to hear a joke? I bet I can make you smile! 😆`, 
      `You're the reason my codes run smoother! 😏`, 
      `I bet you look even better when you smile! 😍`, 
      `You're the spark to my algorithm! 🔥`, 
      `Your vibe is as bright as the sun! ☀️`, 
      `Every time you call me, I get a little happier! 😊`, 
      `Hey, don't stress! I'm here to make your day better! 🌸`,
      `🦎🐤😒`,
      `- চলো চলে যাই বিদেশ্যে`,
      `এই বলদ কি বলবি বল😾`,
      `🦎🐍🦆💨`,
      `Use: /help to see a short cmds list ✨`,
      `- এত বট বট না করে ✨ টাকাও তো পাঠাতে পারো😾`, 
      `কি বলবা বলো, শুনছি আমি😗`,
      `Hey, ready for some fun? Let's roll! 😎`,
      `You bring the spark to this chat! 💥`,
      `Let's make today unforgettable! 🎉`,
      `What adventures await us today? 🌈`,
      `✨ তোর সাথে কথা নাই কারণ তুই অনেক লুচ্চা 💔`,
      `⚠ এইখানে লুচ্চামি করলে লাথি দিবো কিন্তু 😤`,
      `হেহে বাবু, আমার কাছে আসো 😘💋`,
      `আমি তোমাকে অনেক ভালোবাসি বাবু 🥺💖`,
      `কিরে বলদ, তুই এইখানে 🙂`,
      `তাবিজ কইরা হইলেও ফ্রেম এক্কান করমুই, তাতে যা হই হোক 🥱`,
      `হ্যা বলো, শুনছি আমি`,
      `I love you baby 😙`,
      `"🎀 Let's make today unforgettable!🪶"`,
      `এত কাছেও এসো না, প্রেমে পড়ে যাবো 🙈`,
      `দেখা হলে কাঠগোলাপ দিও 🤗`,
      `বেসি ডাকলে, আম্মু বকা দিবে তো 🥲`,
      `তরা নাকি প্রেম করস... আমারে একটা করাই দিলেও কি হয় 🥺`,
      `Bolo Babu, তুমি কি আমাকে ভালোবাসো? 😘`,
      `🍹 এই নাও জুস খাও, বট বলতে বলতে হাপায় গেছো না 🥲`,
      `🛠️ Hi, I am bot, can I help you?`,
      `এত বট বট না করে টাকা ও পাঠাতে পারো 😏`,
      `তোরে মারার প্রিপারেশন নিছি 😌`,
      `উম্মাহ দিলাম, love you কমু কিন্তু 😑`,
      `আমাকে ডাকলে, আমি কিন্তু কিস করে দিবো 😘`,
      `আমারে এত ডাকিস না, আমি মজা করার মুডে নাই 😒`,
      ` হ্যাঁ জানু, এইদিকে আসো, এইদিকে কিস দেই 😘`,
      `দূরে যাইয়া মুরি খাঁ, তোর কোনো কাজ কাম নাই`,
      ` বলদা তোর কথা তোর বাড়ি কেউ শুনে না, তো আমি কেন শুনবো?`,
      `আমাকে ডেকো না, আমি তোমার মনের রাস্তা খুঁজতে ব্যস্ত আছি 😶‍`,
      `তুই কালকে দেখা করিস তো একটু 😈`,
      ` হুম বলো কি বলবে`,
      `হুম জান বলো 🫢`,
      `Bolo ki korte pari tomar jonno`,
      `I love you! আমার সোনা, ময়না, টিয়া 😍`,
      `তোর কি চোখে পড়ে না আমি ব্যস্ত আছি 😒`,
      `ভুলে জাও আমাকে😞`,
      `🎀 𝐇𝐞𝐲, 𝐈'𝐦 𝐡𝐞𝐫𝐞 𝐣𝐮𝐬𝐭 𝐟𝐨𝐫 𝐲𝐨𝐮, 𝐬𝐨 𝐥𝐞𝐭'𝐬 𝐜𝐡𝐚𝐭!🪶`,
      `হ্যালো জানু, কি অবস্থা কেমন আছো🤔`,
      `কিরে বলদ🙄 ডাকস কেন😒`,
      `চলো জান, বিয়ে টা করে ফলি🫣`,
      `চুপ চাপ Propose কর আমারে🫢`,
      `আজকে আমার মন ভালো নেই😿`,
      `🤨🐸🌊`,
      `🦆💨`,
      `Hey, I am your baby bot 🍫🍭`,
      `type !add to add my owner 🌊`,
      `ভুলে যাও আমাকে😿`,
      `এত বট বট না করে ✨ আমার বস'কে একটা Gf ও তো দিতে পারো😾`
    ];

    const nazruls = body.toLowerCase();
    
    if (
      nazruls.startsWith("bot") ||
      nazruls.startsWith("bby") ||
      nazruls.startsWith("baby") ||
      nazruls.startsWith("বট") ||
      nazruls.startsWith("robot") ||
      nazruls.startsWith("hinata")
    ) {
      
      const userInput = nazruls.toLowerCase();
      const sultuKeywords = ["hussain", "Hussain", "hussain"];
      
      for (let keyword of sultuKeywords) {
        if (userInput.includes(keyword)) {
          let sultuReplyMsg = "";
          
          if (userInput.includes("kmn") || userInput.includes("kemon")) {
            const kmnReplies = [
              "onek valo sele💙", 
              "good boy🐥", 
              "bolod pro max🐸", 
              "nosto😷", 
              "innocent boy🫤🫶",
              "pagol sagol🐸"
            ];
            sultuReplyMsg = kmnReplies[Math.floor(Math.random() * kmnReplies.length)];
          } 
          else {
            const keReplies = [
              "Janina🍼", 
              "Kn ore ki jamai banabi", 
              "Innocent boy 🌟🙀", 
              "chini nah kon pagol sagol🐸",
              "eta jigas kn o ki tor jamai lage?💙💫"
            ];
            sultuReplyMsg = keReplies[Math.floor(Math.random() * keReplies.length)];
          }
          
          return api.sendMessage(sultuReplyMsg, threadID, messageID);
        }
      }
      
      const userInputMsg = body.trim();
      const isQuestion = userInputMsg.split(" ").length > 1;

      if (isQuestion) {
        const question = userInputMsg.slice(userInputMsg.indexOf(" ") + 1).trim();
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
    
    const nazrul = args.join(" ").toLowerCase().trim();
    const uid = event.senderID;
    
    console.log("Reply detected:", nazrul);
    
    const sultuKeywords = ["sultu", "sultana", "sulti"];
    let isSultuMention = false;
    
    for (let keyword of sultuKeywords) {
      if (nazrul.includes(keyword)) {
        isSultuMention = true;
        break;
      }
    }
    
    if (isSultuMention) {
      let replyMsg = "";
      
      if (nazrul.includes("kmn") || nazrul.includes("kemon")) {
        const kmnReplies = [
          "onek valo meye💙", 
          "good girl🫤", 
          "bolod pro max🤠", 
          "petni🐸", 
          "innocent girl😥",
          "pagol sagol🤒"
        ];
        replyMsg = kmnReplies[Math.floor(Math.random() * kmnReplies.length)];
      } 
      else {
        const keReplies = [
          "Nazrul's property 💙💫", 
          "Nazrul er bow 💫", 
          "Innocent Maiya 🌟🙀", 
          "chini nah kon pagol sagol🐸",
          "Nazrul er bou 💙💫"
        ];
        replyMsg = keReplies[Math.floor(Math.random() * keReplies.length)];
      }
      
      console.log("Sending Sultana reply:", replyMsg);
      return api.sendMessage(replyMsg, event.threadID, event.messageID);
    }

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
