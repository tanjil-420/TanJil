module.exports = {
 config: {
	 name: "joy",
	 version: "1.0",
	 author: "AceGun",
	 countDown: 5,
	 role: 0,
	 shortDescription: "no prefix",
	 longDescription: "no prefix",
	 category: "no prefix",
 },

 onStart: async function(){}, 
 onChat: async function({ event, message, getLang }) {
 if (event.body && event.body.toLowerCase() === "Hussain") {
 return message.reply({
 body: " 「  𝐻𝐸𝑌 𝐼 𝐴𝑀 𝐼𝑇𝐴𝐶𝐻𝐼 𝑈𝐶𝐻𝐼𝐻𝐴💀 𝑀𝑌 𝐶𝑅𝐸𝐴𝑇𝑂𝑅 𝐻𝑈𝑆𝑆𝐴𝐼𝑁 7𝑋🌟🍂 \n\n𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥\n𝐌𝐎𝐇𝐀𝐌𝐌𝐀𝐃 𝐁𝐀𝐘𝐉𝐈𝐃」",
 attachment: await global.utils.getStreamFromURL("https://i.imgur.com/bGPCqh9.mp4")
 });
 }
 }
}
