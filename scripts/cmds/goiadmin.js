const axios = require("axios");

let lastResponse = null;

module.exports = {
  config: {
    name: "goiadmin",
    author: "Eren",
    role: 0,
    shortDescription: "Owner Mention Protection",
    longDescription: "Prevents unnecessary mentions of Eren",
    category: "BOT",
    guide: "{pn}"
  },

  onChat: async function({ api, event }) {
    const authorID = "61590015983221";

    if (event.senderID !== authorID) {
      const mentions = Object.keys(event.mentions || {});
      if (mentions.includes(authorID)) {
        const responses = [
          "𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩\n ওর Gf lagbe... ore mention দিও না ভাই! 😤\n𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩",
          "𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩\n Gf না দিলে mention দিও না! 🙄\n মনের কষ্টে বাঁচতে চাই! 😢\n𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩",
          "𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩\n Oi tui mention dili kno?\n Ore ki Gf dibi? 🫡\n𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩",
          "𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩\n Or bow হতে চাও দেখে mention মারতেসো? 🙈\n𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩",
          "𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩\n ভাই, ও already taken! 💔\n Gf ছাড়া tag দেওয়া নিষিদ্ধ! 🚫\n𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩",
          "𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩\n তোর কাছে দেওয়ার গফ নাই ভাই, তাই Hussain কে ট্যাগ করিস না! 😑\n𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩",
          "𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩\n Gf ছাড়া মেন্সন 😭\n তোর হুলিয়া টাইট করে দিব  🤖\n𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩",
          "𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩\n Hussain এর Gf তুই? 🤔\n তাহলে tag legit, না হলে ❌\n𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩",
          "𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩\n যদি Gf দিতে পারিস, tag করতে পারবি 😌\n𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩",
          "𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩\n মেনশন না করে Gf হবার চেষ্টা কর! 🥺\n𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩",
          "𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩\n Tag মারার আগেই ভাব,\n Gf আছো তো দেওয়ার জন্য ? 🤨\n𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩",
          "𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩\n Hussain কে tag করার ticket = 1 Gf 🎫\n𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩",
          "𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩\n মেনশন করার আগে একটা Gf দে, তারপর কথা বল! 🫠\n𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩",
          "𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩\n Or, gf নাই দেইখা Hussain কে tag দিচ্ছিস? 🫥\n𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩",
          "𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩\n বউ দিয়া দিতে পারলে tag কর, না হলে পালা! 🏃‍♂️💨\n𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩",
          "𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩\n Love guru হইছোস নাকি, Hussain কে tag দিয়ে? ❤️‍🔥\n𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩",
          "𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩\n Gf দিতে হলে Hussain কে tag দিস?\n বুইঝা কাম কর ভাই! 😤\n𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩",
          "𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩\n Single দের মেনশন নিষেধ...\n Gf আন, তারপর আয়! 🚫❤️\n𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩",
          "𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩\n Gf ready কর, তারপর Hussain কে mention দে! 😎\n𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩",
          "𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩\n GF ছাড়া mention মানা! Tag মারবি না... warning দিলাম! ⚠️\n𐙚━━━━━━━━━━━━━━━━━ᡣ𐭩"
        ];

        let filtered = responses.filter(msg => msg !== lastResponse);
        if (filtered.length === 0) filtered = responses;

        const random = filtered[Math.floor(Math.random() * filtered.length)];
        lastResponse = random;

        return api.sendMessage({ body: random }, event.threadID, event.messageID);
      }
    }
  },

  onStart: async function() {
    console.log("✅ goiadmin Module Loaded with Anti-Repeat Random System (No External JSON)");
  }
};
