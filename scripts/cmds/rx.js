const axios = require('axios');

const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json`
  );
  return base.data.romim;
};
module.exports = {
  config: {
    name: 'rx',
    category: 'MEDIA',
    author: 'Nyx',
    description: 'Image, Video , sound to link'
  },

  onStart: async ({ event, message }) => {

    const att = event.messageReply?.attachments?.[0]?.url;
    if (!att) return message.reply("Reply to an Image or Video or Sound");

    try {
      const tinyUrlResponse = await axios.get(`https://tinyurl.com/api-create.php?url=${att}`);
      const U = tinyUrlResponse.data;
       const {data} = await axios.get(`${await baseApiUrl()}api/rx?url=${U}`);
      const url = data.url;
        message.reply(url);

    } catch (e) {
      message.reply("Error: " + e.message);
    }
  }
};
