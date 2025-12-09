module.exports = {
  config: {
    name: "edit",
    aliases: ["e", "aiedit"],
    version: "1.6.9",
    author: "Nazrul",
    role: 0,
    description: "Edit image by URL or reply with model selection",
    category: "ai",
    usePrefix: true,
    isPremium: false,
    countDown: 10,
    guide: {
      en: "{pn} [url] [prompt] [model]\nModels: 1=nano 2=4o 3=flash 4=qwen 5=flux"
    }
  },

  onStart: async ({ message, event, args }) => {
    const models = [
      { n: "1", name: "nano-banana", s: "nano", as: ["nano", "nano-banana"] },
      { n: "2", name: "4o-image", s: "4o", as: ["4o", "4o-image", "gpt"] },
      { n: "3", name: "gemini-flash-edit", s: "flash", as: ["flash", "gemini", "gemini-flash-edit"] },
      { n: "4", name: "qwen-image-edit", s: "qwen", as: ["qwen", "qwen-image-edit"] },
      { n: "5", name: "flux-dev", s: "flux", as: ["flux", "flux-dev"] }
    ];

    let imgUrl = event.messageReply?.attachments?.[0]?.type === "photo" ? event.messageReply.attachments[0].url : args[0];
    let l = (args.slice(-1)[0] || "").replace(/^--/, "").toLowerCase();
    let model = models.find(m => m.n === l || m.name === l || m.as.includes(l));
    let mt = model ? l : null;
    let prompt = args.slice(event.messageReply?.attachments?.[0]?.type === "photo" ? 0 : 1, model ? -1 : undefined).join(" ");
    model = model || models[0];
    let { n: mn, s: ms } = model;

    if (!imgUrl) return message.reply("• Reply to an image or provide image URL!\n• Add prompt and model (-- nano/4o/qwen/flash/flux)");

    message.reaction('⏳', event.messageID);
    const wm = await message.reply(`⏳ Editing your image with Model ${ms} ...!`);

    try {
      const apiUrl = (await require("axios").get("https://raw.githubusercontent.com/nazrul4x/Noobs/main/Apis.json")).data.api2;
      const res = await require("axios").get(`${apiUrl}/edit?imgUrl=${encodeURIComponent(imgUrl)}&prompt=${encodeURIComponent(prompt)}&model=${mn}`);
      const u = res.data?.data?.imageResponseVo?.images?.[0].url;

      message.reaction('✅', event.messageID);
      await message.unsend(wm.messageID);

      if (u) {
  const p = (require('path').join(__dirname, `edited_${Date.now()}.jpg`));
  const boobs = (await require('axios').get(u, { responseType: "arraybuffer" })).data;
  require('fs').writeFileSync(p, boobs);

  await message.reply({
    body: `✅ Here's your Edited image!\n• (Model: ${ms})`,
    attachment: (require('fs').createReadStream(p))
  });

  (require('fs').unlinkSync(p));
  return;
}
      return message.reply("× Not found any result!");
    } catch {
      message.reaction('❌', event.messageID);
      await message.unsend(wm.messageID);
    }
  }
};
