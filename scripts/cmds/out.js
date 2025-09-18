const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");

module.exports = {
  config: {
    name: "out",
    aliases: ["o"],
    version: "1.0",
    author: "Sandy",
    countDown: 5,
    role: 2,
    shortDescription: "bot will leave gc",
    longDescription: "",
    category: "admin",
    guide: {
      vi: "{pn} [tid,blank]",
      en: "{pn} [tid,blank]"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    var id;
    if (!args.join(" ")) {
      id = event.threadID;
    } else {
      id = parseInt(args.join(" "));
    }

    const leaveMessage = 
`╭───────────────⋆⋅☆⋅⋆───────────────╮
        𝒀𝒐𝒖𝒓 𝑩𝒂𝒃𝒚 𝒊𝒔 𝑳𝒆𝒂𝒗𝒊𝒏𝒈... 🌙
╰───────────────⋆⋅☆⋅⋆───────────────╯

     ❝ Every goodbye makes the next hello closer... ❞

    🕊️  May peace be upon you, always.
    🌸  Stay safe, stay kind, stay smiling.
    💫  If destiny wills, we shall meet again.
    🥀  Till then… hold me in your prayers.

          — With love, always... 𝒀𝒐𝒖𝒓 𝑩𝒂𝒃𝒚 ❤️

╭───────────────────────────────╮
         ✦ 𝑨𝒍𝒍𝒂𝒉 𝑯𝒂𝒇𝒊𝒛 ✦ 𝑲𝒉𝒖𝒅𝒂 𝑯𝒂𝒇𝒊𝒛 ✦
╰───────────────────────────────╯`;

    return api.sendMessage(leaveMessage, id, () => 
      api.removeUserFromGroup(api.getCurrentUserID(), id)
    );
  }
} 
