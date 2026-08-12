const { config } = global.GoatBot;
const { writeFileSync, existsSync } = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "mainadmin",
    aliases: ["madmin"],
    version: "3.0",
    author: "Nazrul",
    countDown: 5,
    role: 2,
    description: { en: "Manage main admin: Assign, revoke, or display main admins." },
    category: "admin",
    guide: {
      en: `{pn} [add | -a] <uid | @tag>: Assign main admin
{pn} [remove | -r] <uid | @tag>: Revoke main admin
{pn} [list | -l]: Show main admin list`
    },
  },

  langs: {
    en: {
      added: "✅ | Assigned main admin to %1 user(s):\n%2",
      alreadyAdmin: "\n⚠ | %1 user(s) already main admin:\n%2",
      missingIdAdd: "⚠ | Provide UID or tag to assign main admin.",
      removed: "✅ | Revoked main admin from %1 user(s):\n%2",
      notAdmin: "⚠ | %1 user(s) are not main admins:\n%2",
      missingIdRemove: "⚠ | Provide UID or tag to remove main admin.",
      listAdmin: `👑 | Main Admin List | 👑  
╭───────────╮   
%1  
╰───────────╯`,
      protectMessage: "🚫 | Removing the primary main admin is not allowed!",
      usageList: "🪄 | Main Admin Commands:\n" +
        "{pn} [add | -a] <uid | @tag>: Assign main admin\n" +
        "{pn} [remove | -r] <uid | @tag>: Revoke main admin\n" +
        "{pn} [list | -l]: View main admins",
      permissionError: "⚠ | This command can only be used by the main admin."
    },
  },

  onStart: async function ({ message, args, usersData, event, getLang, globalData }) {
    const senderId = event.senderID;
    const mainAdminId = config.main_admin;
    const configKey = "mainAdmins";

    if (senderId !== mainAdminId) return message.reply(getLang("permissionError"));

    function syncToConfig(mainAdmins) {
      config.main_admins = mainAdmins;
      const devPath = path.join(process.cwd(), "config.dev.json");
      const mainPath = path.join(process.cwd(), "config.json");
      const configPath = existsSync(devPath) ? devPath : existsSync(mainPath) ? mainPath : devPath;
      writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
    }

    let mainAdminsData = await globalData.get(configKey);
    if (!mainAdminsData) {
      await globalData.create(configKey, { data: config.main_admins || [] });
      mainAdminsData = await globalData.get(configKey);
    }
    const mainAdmins = mainAdminsData.data;

    const localAdmins = config.main_admins || [];
    const missingInGlobal = localAdmins.filter(uid => !mainAdmins.includes(uid));
    if (missingInGlobal.length > 0) mainAdmins.push(...missingInGlobal);
    const missingInLocal = mainAdmins.filter(uid => !localAdmins.includes(uid));
    if (missingInLocal.length > 0) config.main_admins = Array.from(new Set([...localAdmins, ...missingInLocal]));

    syncToConfig(mainAdmins);

    const replyUser = event.messageReply ? event.messageReply.senderID : null;

    if (!args[0]) return message.reply(getLang("usageList"));

    switch (args[0]) {
      case "add":
      case "-a": {
        if (!args[1] && !replyUser) return message.reply(getLang("missingIdAdd"));
        let uids = replyUser ? [replyUser] : Object.keys(event.mentions).length > 0 ? Object.keys(event.mentions) : args.filter(a => !isNaN(a));

        const added = [];
        const already = [];
        for (const uid of uids) mainAdmins.includes(uid) ? already.push(uid) : added.push(uid);

        mainAdmins.push(...added);
        await globalData.set(configKey, { data: mainAdmins });
        syncToConfig(mainAdmins);

        const names = await Promise.all(uids.map(uid => usersData.getName(uid).then(n => ({ uid, name: n }))));
        return message.reply(
          (added.length ? getLang("added", added.length, names.filter(u => added.includes(u.uid)).map(u => `• ${u.name}\n╰${u.uid}`).join("\n")) : "") +
          (already.length ? getLang("alreadyAdmin", already.length, already.map(uid => `• ${uid}`).join("\n")) : "")
        );
      }

      case "remove":
      case "-r": {
        if (!args[1] && !replyUser) return message.reply(getLang("missingIdRemove"));
        let uids = replyUser ? [replyUser] : Object.keys(event.mentions).length > 0 ? Object.keys(event.mentions) : args.filter(a => !isNaN(a));

        const removed = [];
        const notFound = [];
        for (const uid of uids) {
          if (uid === mainAdminId) return message.reply(getLang("protectMessage"));
          mainAdmins.includes(uid) ? removed.push(uid) : notFound.push(uid);
        }

        for (const uid of removed) mainAdmins.splice(mainAdmins.indexOf(uid), 1);
        await globalData.set(configKey, { data: mainAdmins });
        syncToConfig(mainAdmins);

        const names = await Promise.all(removed.map(uid => usersData.getName(uid).then(n => ({ uid, name: n }))));
        return message.reply(
          (removed.length ? getLang("removed", removed.length, names.map(u => `• ${u.name}\n╰${u.uid}`).join("\n")) : "") +
          (notFound.length ? getLang("notAdmin", notFound.length, notFound.map(uid => `• ${uid}`).join("\n")) : "")
        );
      }

      case "list":
      case "-l": {
        const names = await Promise.all(mainAdmins.map(uid => usersData.getName(uid).then(n => ({ uid, name: n }))));
        return message.reply(getLang("listAdmin", names.map(u => `• ${u.name}\n╰${u.uid}`).join("\n")));
      }

      default:
        return message.reply(getLang("usageList"));
    }
  },
};