const axios = require("axios");

module.exports.config = {
  name: "screenshot",
  aliases: ["ss","ssweb"],
  version: "1.6.9",
  author: "Nazrul",
  role: 0,
  description: "Take a screenshot of a website",
  category: "tools",
  usePrefix: true,
  guide: { en: "{pn} [URL]" },
  coolDowns: 5,
};

exports.onStart = async function ({ message, args }) {
  let url = args.join(" ").trim();
  if (!url) return message.reply("• Provide a website URL.");
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;

  try {
    const { m: apiUrl } = (await axios.get("https://raw.githubusercontent.com/nazrul4x/Noobs/main/Apis.json")).data;
    const stream = (await axios({
      url: `${apiUrl}/nazrul/screenshot?url=${encodeURIComponent(url)}`,
      method: "GET",
      responseType: "stream"
    })).data;

    return message.reply({ body: `✅ Taked Screenshot of:\n${url}`, attachment: stream });
  } catch (e) {
    return message.reply("❌ Failed to take a screenshot.");
  }
};
