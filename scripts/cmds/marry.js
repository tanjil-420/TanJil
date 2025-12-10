const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs")

module.exports = {
    config: {
        name: "marry",
        aliases: ["marryv4","marryfour"],
        version: "1.0",
        author: "\x4c\x45\x41\x52\x4e\x20\x54\x4f\x20\x45\x41\x54\x20\x4c\x45\x41\x52\x4e\x20\x54\x4f\x20\x53\x50\x45\x41\x4b\x20\x42\x55\x54\x20\x44\x4f\x4e\'\x54\x20\x54\x52\x59\x20\x54\x4f\x20\x43\x48\x41\x4e\x47\x45\x20\x54\x48\x45\x20\x43\x52\x45\x44\x49\x54\x20\x41\x4b\x41\x53\x48",
        countDown: 5,
        role: 0,
        shortDescription: "get a wife",
        longDescription: "mention your love❗",
        category: "funny",
        guide: "{pn} @mention | {pn} <uid> | {pn} <reply>"
    },

    onStart: async function ({ message, event, args }) {
        let target;
        const mention = Object.keys(event.mentions);

        if (mention.length > 0) {
            // Case 1: @mention
            target = mention[0];
        } else if (args[0] && !isNaN(args[0])) {
            // Case 2: UID
            target = args[0];
        } else if (event.messageReply) {
            // Case 3: Reply
            target = event.messageReply.senderID;
        }

        if (!target) return message.reply("Please mention someone, give UID, or reply to their message❗");

        const one = event.senderID;
        const two = target;

        bal(one, two).then(ptth => { 
            message.reply({ body: "got married 😍", attachment: fs.createReadStream(ptth) }) 
        });
    }
};

async function bal(one, two) {//credit akash #_#

    let avone = await jimp.read(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`)
    avone.circle()
    let avtwo = await jimp.read(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`)
    avtwo.circle()
    let pth = "marryv4.png"
    let img = await jimp.read("https://i.postimg.cc/XN1TcH3L/tumblr-mm9nfpt7w-H1s490t5o1-1280.jpg")

    img.resize(1024, 684).composite(avone.resize(85, 85), 204, 160).composite(avtwo.resize(80, 80), 315, 105);//don't change the credit X-------D

    await img.writeAsync(pth)
    return pth
        }
