const { config } = global.GoatBot;
const { writeFileSync, existsSync, readFileSync } = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "admin",
    version: "3.0",
    author: "NTKhang",
    countDown: 5,
    role: 0,
    description: {
      en: "Manage admin roles: Add, remove, or list admins"
    },
    category: "system",
    guide: {
      en: `   {pn} [add | -a] <uid | @tag>: Add admin role to a user
                \n   {pn} [remove | -r] <uid | @tag>: Remove admin role from a user
                \n   {pn} [list | -l]: Display a list of all admins`
    }
  },

  langs: {
    en: {
      added: "✅ | Successfully added admin role for %1 users:\n%2",
      alreadyAdmin: "\n⚠ | %1 users are already admins:\n%2",
      missingIdAdd: "⚠ | Please provide a valid ID or tag to add admin role",
      removed: "✅ | Successfully removed admin role from %1 users:\n%2",
      notAdmin: "⚠ | %1 users are not admins:\n%2",
      missingIdRemove: "⚠ | Please provide a valid ID or tag to remove admin role",
      listAdmin: `👑 |  Bot Admins & Operators | 👑  
⎯⎯⎯⎯⎯⎯⎯⎯⎯    
%1  
⎯⎯⎯⎯⎯⎯⎯⎯⎯  
•× | Operators | •×
⎯⎯⎯⎯⎯⎯⎯⎯⎯    
%3  
⎯⎯⎯⎯⎯⎯⎯⎯⎯  `,
      protectMessage: "- Get lost, Nonsense!",
      replyPromptAdd: "📩 | Reply to a user message to add them as an admin!",
      replyPromptRemove: "📩 | Reply to a user message to remove them from the admin list!",
      permissionError: "⚠ | You do not have permission to use this command.",
      usageList: "🪄 | Admin Command Usages:\n" +
        "{pn} [add | -a] <uid | @tag>: Add admin role to a user\n" +
        "{pn} [remove | -r] <uid | @tag>: Remove admin role from a user\n" +
        "{pn} [list | -l]: Display a list of all admins"
    }
  },

  onStart: async function({ message, args, usersData, event, getLang, globalData }) {
    const senderId = event.senderID;
    const configKey = "adminBot";
    const operatorKey = "operatorBot";
    const mainAdminId = "61581661921122";

    const devPath = path.join(process.cwd(), "config.dev.json");
    const mainPath = path.join(process.cwd(), "config.json");
    const configPath = existsSync(devPath) ? devPath : mainPath;

    function readLocalConfig() {
      try {
        const data = JSON.parse(readFileSync(configPath, "utf8"));
        return {
          adminBot: data.adminBot || [],
          operatorBot: data.operatorBot || []
        };
      } catch {
        return { adminBot: [], operatorBot: [] };
      }
    }

    function writeLocalConfig(admins, operators) {
      try {
        const local = JSON.parse(readFileSync(configPath, "utf8"));
        local.adminBot = admins;
        local.operatorBot = operators;
        writeFileSync(configPath, JSON.stringify(local, null, 2), "utf8");
      } catch (err) {
        console.error("❌ Failed to write config:", err);
      }
    }

    let local = readLocalConfig();
    let globalAdmins = [], globalOperators = [];

    try {
      const gAdmin = await globalData.get(configKey);
      const gOperator = await globalData.get(operatorKey);
      globalAdmins = gAdmin?.data || [];
      globalOperators = gOperator?.data || [];

      const missingAdmins = local.adminBot.filter(uid => !globalAdmins.includes(uid));
      if (missingAdmins.length > 0) {
        globalAdmins.push(...missingAdmins);
        await globalData.set(configKey, { data: globalAdmins });
        console.log("✅ Synced extra admins from config.json → globalData:", missingAdmins);
      }

      if (globalAdmins.length === 0 && local.adminBot.length > 0)
        await globalData.set(configKey, { data: local.adminBot });

      if (globalOperators.length === 0 && local.operatorBot.length > 0)
        await globalData.set(operatorKey, { data: local.operatorBot });

      const allAdmins = Array.from(new Set([...local.adminBot, ...globalAdmins]));
      const allOperators = Array.from(new Set([...local.operatorBot, ...globalOperators]));

      writeLocalConfig(allAdmins, allOperators);
      config.adminBot = allAdmins;
      config.operatorBot = allOperators;

    } catch (err) {
      console.warn("⚠️ GlobalData unavailable, using local only.");
      config.adminBot = local.adminBot;
      config.operatorBot = local.operatorBot;
    }

    const adminConfig = config.adminBot;
    const operatorConfig = config.operatorBot;
    const isAdmin = adminConfig.includes(senderId);
    const replyToUser = event.messageReply ? event.messageReply.senderID : null;

    if (args.length === 0) return message.reply(getLang("usageList"));

    async function updateSync() {
      writeLocalConfig(adminConfig, operatorConfig);
      try {
        await globalData.set(configKey, { data: adminConfig });
        await globalData.set(operatorKey, { data: operatorConfig });
      } catch {
        console.warn("⚠️ GlobalData sync failed, but local saved.");
      }
    }

    switch (args[0]) {
      case "add":
      case "-a": {
        if (!isAdmin) return message.reply(getLang("permissionError"));

        let uids = [];
        if (replyToUser) uids.push(replyToUser);
        else if (Object.keys(event.mentions).length > 0)
          uids = Object.keys(event.mentions);
        else if (args[1])
          uids = args.filter(a => /^\d+$/.test(a));

        if (uids.length === 0) return message.reply(getLang("missingIdAdd"));

        const added = [], already = [];
        for (const uid of uids) {
          if (adminConfig.includes(uid)) already.push(uid);
          else added.push(uid);
        }

        adminConfig.push(...added);
        await updateSync();

        const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));

        return message.reply(
          (added.length ? getLang("added", added.length, getNames.filter(x => added.includes(x.uid)).map(x => `• ${x.name}\n╰${x.uid}`).join("\n")) : "") +
          (already.length ? getLang("alreadyAdmin", already.length, getNames.filter(x => already.includes(x.uid)).map(x => `• ${x.name}\n╰${x.uid}`).join("\n")) : "")
        );
      }

      case "remove":
      case "-r": {
        if (!isAdmin) return message.reply(getLang("permissionError"));

        let uids = [];
        if (replyToUser) uids.push(replyToUser);
        else if (Object.keys(event.mentions).length > 0)
          uids = Object.keys(event.mentions);
        else uids = args.filter(a => /^\d+$/.test(a));

        if (uids.length === 0) return message.reply(getLang("missingIdRemove"));

        const removed = [], notAdmin = [];
        for (const uid of uids) {
          if (uid === mainAdminId) return message.reply(getLang("protectMessage"));
          if (adminConfig.includes(uid)) {
            adminConfig.splice(adminConfig.indexOf(uid), 1);
            removed.push(uid);
          } else notAdmin.push(uid);
        }

        await updateSync();
        const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));

        return message.reply(
          (removed.length ? getLang("removed", removed.length, getNames.filter(x => removed.includes(x.uid)).map(x => `• ${x.name}\n╰${x.uid}`).join("\n")) : "") +
          (notAdmin.length ? getLang("notAdmin", notAdmin.length, getNames.filter(x => notAdmin.includes(x.uid)).map(x => `• ${x.name}\n╰${x.uid}`).join("\n")) : "")
        );
      }

      case "list":
      case "-l": {
        const getNames = await Promise.all(adminConfig.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));

        const main = [], ops = [], others = [];
        getNames.forEach(({ uid, name }) => {
          if (uid === mainAdminId) main.push(`👑 ${name} (Owner)\n╰${uid}`);
          else if (operatorConfig.includes(uid)) ops.push(`🛡️ ${name}\n╰${uid}`);
          else others.push(`• ${name}\n╰${uid}`);
        });

        return message.reply(getLang("listAdmin", main.join("\n") || "None", ops.join("\n") || "None", others.join("\n") || "None"));
      }

      default:
        return message.SyntaxError();
    }
  }
};