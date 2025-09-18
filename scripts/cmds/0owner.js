module.exports = {
  config: {
    name: "owner",
    version: 2.3,
    author: "〲 T A N J I L ツ",
    longDescription: "Info about bot and owner",
    category: "Special",
    guide: {
      en: "{p}{n}",
    },
  },

  onStart: async function ({ api, event, usersData, message }) {
    // Primary & Backup Image
    const mainImg = "https://files.catbox.moe/b2yna5kbctsvlk34.jpg"; 
    const fallbackImg = "https://scontent.xx.fbcdn.net/v/t1.15752-9/537397354_1980840699345865_2351462868400401293_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeELEqegXfQ4KYDcfhxBeTOQ8Sc-8NlEdSTxJz7w2UR1JNU_ulrw4ibTJWIFZC7qozxdd28C1XQ63DB782_ToWCc&_nc_ohc=Esrv3yEutLMQ7kNvwEQT-7K&_nc_oc=Adl4QxI9HvtgZvHZznG2sj2I-BKlOq-nyQh0zEvkzbMEVnre7bHSgXlSpg384MVJKso&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.xx&oh=03_Q7cD3AHQtbJtqIVF2z5_YpsUMvsuuJlLjkLHZvqv8xMhH5V-0A&oe=68D18740"; // backup

    let attachment;
    try {
      attachment = await global.utils.getStreamFromURL(mainImg);
    } catch (e) {
      attachment = await global.utils.getStreamFromURL(fallbackImg);
    }

    const id = event.senderID;
    const userData = await usersData.get(id);
    const name = userData.name;
    const mentions = [{ id, tag: name }];

    // Owner & Bot Info
    const info = {
      botName: "✨YOUR 卝 চুন্নি✨",
      prefix: "/",
      ownerName: "〲 T A N J I L ツ",
      uid: "61579509758592",
      username: "picchi143",
      gender: "Male",
      number: "01749315157",
      age: "19 ±",
      relationship: "Single",
      study: "Honours",
      location: "Dhaka, Bangladesh",
      religion: "Islam"
    };

    const body = `⎯ [(🌷) OWNER INFO (🌷)] ⎯
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

Name     : ${info.ownerName}
UID      : ${info.uid}
U.n.     : ${info.username}

Age      : ${info.age}
Study    : ${info.study}
Status   : ${info.relationship}

Number   : ${info.number}
House    : ${info.location}
Religion : ${info.religion}

⎯⎯⎯⎯ [ 🔧 BOT INFO ] ⎯⎯⎯⎯
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

🤖 Bot Name : ${info.botName}
📌 Prefix   : ${info.prefix}
👑 Author   : ${info.ownerName}`;

    message.reply({
      body,
      attachment,
      mentions
    });
  }
};
