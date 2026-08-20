const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "T A N J I L 🎀";

const categoryGroups = {
    "AI & IMAGE": ["ai", "ai music", "art", "gpt", "chatgpt", "ai assistant", "assistant", "ai image"],
    "IMAGE": ["image", "photo", "picture", "img", "imgs", "photos"],
    "MEDIA & VIDEO": ["media", "video", "audio", "music"],
    "GENERAL": ["general"],
    "BANKING": ["banking", "bank", "boney"],
    "FUN & GAMES": ["fun", "games", "game"],
    "SYSTEM & UTILITY": ["utility", "tools", "tool", "system"],
    "ADMIN": ["admin", "moderation", "owner", "noobs", "god"],
    "GROUP": ["group", "thread", "threads", "box", "box chat", "chatbox", "boxchat"]
};

function getGroupCategory(cat) {
    if (!cat) return "OTHERS";
    const lowerCat = cat.toLowerCase();
    for (const [groupName, keywords] of Object.entries(categoryGroups)) {
        if (keywords.includes(lowerCat)) {
            return groupName;
        }
    }
    return cat.toUpperCase();
}

module.exports = {
    config: {
        name: "help",
        version: "2.3.0",
        author: "T A N J I L 🎀",
        countDown: 3,
        role: 0,
        usePrefix: true,
        shortDescription: {
            en: "View command usage and search by category, author, or keyword."
        },
        longDescription: {
            en: "Displays all commands, allows searching by category, author, or specific words."
        },
        category: "info",
        guide: {
            en: "{pn} [empty | commandName]"
                + "\n {pn} category|c|-c|cat - Commands in category"
                + "\n {pn} search|sr|-s|find - Search commands"
                + "\n {pn} author|a|-a|by - Commands by author"
                + "\n {pn} [-u | usage | -g | guide]: only show command usage"
                + "\n {pn} [-i | info]: only show command info"
                + "\n {pn} [-r | role]: only show command role"
                + "\n {pn} [-a | alias]: only show command alias"
        },
        priority: 1
    },

    langs: {
        en: {
            help: "",
            help2: "",
            commandNotFound: 'Command "%1" does not exist',
            getInfoCommand: "֎ 🪶 %1 FILE INFO...\n\n✍️ Author: %8\n📦 Version: %5\n🎭 Role: %6\n🌊 Aliases: %3\n⏱ Countdown: %7s\n📂 Category: %10\n📝 Description: %2\n👑 Other names in your group: %4\n🛠 USAGE: %9\n\n֎",
            onlyInfo: "֎ 🪶 INFO\n\n🌊 Command name: %1\n📝 Description: %2\n📓 Aliases: %3\n👑 Other names in your group: %4\n📦 Version: %5\n🎭 Role: %6\n⏳ Countdown: %7s\n🪶 Author:%8\n\n֎",
            onlyUsage: "֎\n\n🛠 Usage: %1\n\n֎",
            onlyAlias: "֎\n\n🪶 Aliases: %1\nOther names in your group: %2\n\n֎",
            onlyRole: "֎\n\n🌊 Role: %1\n\n֎",
            doNotHave: "Do not have",
            roleText0: "0 (All users)",
            roleText1: "1 (Group administrators)",
            roleText2: "2 (Admin bot)",
            roleText0setRole: "0 (set role, all users)",
            roleText1setRole: "1 (set role, group administrators)",
            pageNotFound: "Page %1 does not exist"
        }
    },

    onStart: async function ({ message, args, event, threadsData, getLang, role }) {
        const langCode = await threadsData.get(event.threadID, "data.lang") || global.GoatBot.config.language;
        let customLang = {};
        const pathCustomLang = path.normalize(`${process.cwd()}/languages/cmds/${langCode}.js`);
        if (fs.existsSync(pathCustomLang)) customLang = require(pathCustomLang);

        const { threadID } = event;
        const threadData = await threadsData.get(threadID);
        const prefix = getPrefix(threadID);

        if (args.length > 0) {
            const subCommand = args[0].toLowerCase();
            const categoryAliases = ["category", "c", "-c", "cat"];
            const searchAliases = ["search", "sr", "-s", "find"];
            const authorAliases = ["author", "a", "-a", "by"];

            if (categoryAliases.includes(subCommand) && args[1]) {
                return sendCategoryCommands(message, args[1].toLowerCase(), role);
            }
            if (searchAliases.includes(subCommand) && args[1]) {
                return searchCommands(message, args.slice(1).join(" ").toLowerCase(), role);
            }
            if (authorAliases.includes(subCommand) && args[1]) {
                return searchByAuthor(message, args.slice(1).join(" "), role);
            }
        }

        const commandName = (args[0] || "").toLowerCase();
        const command = commands.get(commandName) || commands.get(aliases.get(commandName));

        if (!command && (args.length === 0 || !isNaN(args[0]) || (args[0] && args[0].startsWith("-")))) {
            const categorizedCommands = {};
            const othersCommands = [];

            commands.forEach((cmd, name) => {
                if (cmd.config.role > 1 && role < cmd.config.role) return;
                const assignedGroup = getGroupCategory(cmd.config.category);
                if (assignedGroup) {
                    if (!categorizedCommands[assignedGroup]) categorizedCommands[assignedGroup] = [];
                    if (!categorizedCommands[assignedGroup].includes(name)) {
                        categorizedCommands[assignedGroup].push(name);
                    }
                } else {
                    if (!othersCommands.includes(name)) othersCommands.push(name);
                }
            });

            function formatCommands(commandsArray) {
                return commandsArray.sort().map((cmd, i) => (i % 3 === 0 ? `\n| ❃ ` : " ❃ ") + cmd).join("");
            }

            let response = "📜 Available Commands in Bot\n\n";
            Object.entries(categorizedCommands).forEach(([category, cmdList]) => {
                response += `| ${category.toUpperCase()} |\n| ❃ ${formatCommands(cmdList)}\n\n`;
            });

            if (othersCommands.length > 0) {
                response += `| OTHERS |\n| ❃ ${formatCommands(othersCommands)}\n\n`;
            }

            response += `⚒️ Bot has: ${commands.size} Commands\n`;
            response += `🛸 Prefix: ${prefix}\n`;
            response += `👑 Owner: T A N J I L 🎀\n\n`;
            response += `Use '${prefix}help <cmdName>' for details.\n`;
            response += `Use '${prefix}help category/c/cat <name>' for category search.\n`;
            response += `Use '${prefix}help search/sr/find <keyword>' to search by keyword.\n`;
            response += `Use '${prefix}help author/a/by <authorName>' to find commands by an author.`;

            const sentMessage = await message.reply(response);
            setTimeout(() => message.unsend(sentMessage.messageID), 60000);
            return;
        }

        if (!command && args[0]) return message.reply(getLang("commandNotFound", args[0]));

        const formSendMessage = {};
        const configCommand = command.config;
        let guide = configCommand.guide?.[langCode] || configCommand.guide?.["en"];
        if (guide == undefined) guide = customLang[configCommand.name]?.guide?.[langCode] || customLang[configCommand.name]?.guide?.["en"];
        guide = guide || { body: "" };
        if (typeof guide == "string") guide = { body: guide };
        
        const guideBody = (guide.body || "No guide available.")
            .replace(/\{prefix\}|\{p\}/g, prefix)
            .replace(/\{name\}|\{n\}/g, configCommand.name)
            .replace(/\{pn\}/g, prefix + configCommand.name);

        const aliasesString = configCommand.aliases ? configCommand.aliases.join(", ") : getLang("doNotHave");
        const aliasesThisGroup = threadData.data.aliases ? (threadData.data.aliases[configCommand.name] || []).join(", ") : getLang("doNotHave");
        
        let roleOfCommand = configCommand.role;
        let roleIsSet = false;
        if (threadData.data.setRole?.[configCommand.name]) {
            roleOfCommand = threadData.data.setRole[configCommand.name];
            roleIsSet = true;
        }
        
        const roleText = roleOfCommand == 0 ? (roleIsSet ? getLang("roleText0setRole") : getLang("roleText0")) : roleOfCommand == 1 ? (roleIsSet ? getLang("roleText1setRole") : getLang("roleText1")) : getLang("roleText2");
        const author = configCommand.author || "Unknown";
        const descriptionCustomLang = customLang[configCommand.name]?.longDescription;
        let description = checkLangObject(configCommand.longDescription, langCode);
        if (description == undefined) {
            if (descriptionCustomLang != undefined) description = checkLangObject(descriptionCustomLang, langCode);
            else description = configCommand.description || getLang("doNotHave");
        }

        let sendWithAttachment = false;
        const category = configCommand.category || "No category";

        if (args[1]?.match(/^-g|guide|-u|usage$/)) {
            formSendMessage.body = getLang("onlyUsage", guideBody.split("\n").join("\n❃"));
            sendWithAttachment = true;
        } else if (args[1]?.match(/^-a|alias|aliase|aliases$/)) {
            formSendMessage.body = getLang("onlyAlias", aliasesString, aliasesThisGroup);
        } else if (args[1]?.match(/^-r|role$/)) {
            formSendMessage.body = getLang("onlyRole", roleText);
        } else {
            formSendMessage.body = getLang(
                "getInfoCommand",
                configCommand.name,
                description,
                aliasesString,
                aliasesThisGroup,
                configCommand.version,
                roleText,
                configCommand.countDown || 1,
                author,
                `${guideBody.split("\n").join("\n»")}`,
                category
            );
            sendWithAttachment = true;
        }

        if (sendWithAttachment && guide.attachment) {
            if (typeof guide.attachment == "object" && !Array.isArray(guide.attachment)) {
                const promises = [];
                formSendMessage.attachment = [];
                for (const keyPathFile in guide.attachment) {
                    const pathFile = path.normalize(keyPathFile);
                    if (!fs.existsSync(pathFile)) {
                        const cutDirPath = path.dirname(pathFile).split(path.sep);
                        for (let i = 0; i < cutDirPath.length; i++) {
                            const pathCheck = `${cutDirPath.slice(0, i + 1).join(path.sep)}${path.sep}`;
                            if (!fs.existsSync(pathCheck)) fs.mkdirSync(pathCheck);
                        }
                        const getFilePromise = axios.get(guide.attachment[keyPathFile], { responseType: 'arraybuffer' })
                            .then(response => fs.writeFileSync(pathFile, Buffer.from(response.data)));
                        promises.push({ pathFile, getFilePromise });
                    } else {
                        promises.push({ pathFile, getFilePromise: Promise.resolve() });
                    }
                }
                await Promise.all(promises.map(item => item.getFilePromise));
                for (const item of promises) formSendMessage.attachment.push(fs.createReadStream(item.pathFile));
            }
        }
        return message.reply(formSendMessage);
    }
};

async function sendCategoryCommands(message, categoryName, role) {
    let matchedCategory = categoryName;
    Object.entries(categoryGroups).forEach(([groupName, keywords]) => {
        if (keywords.includes(categoryName)) {
            matchedCategory = groupName;
        }
    });

    const categoryCommands = [];
    commands.forEach((cmd, name) => {
        if (cmd.config.role <= role) {
            let assignedCategory = cmd.config.category?.toLowerCase();
            const group = getGroupCategory(cmd.config.category);
            if (assignedCategory === categoryName || group.toLowerCase() === categoryName.toLowerCase() || group === matchedCategory) {
                if (!categoryCommands.includes(name)) categoryCommands.push(name);
            }
        }
    });

    if (categoryCommands.length === 0) {
        return message.reply(`❌ No commands found in category '${categoryName}'.`);
    }

    let response = `📜 Commands in Category: ${matchedCategory.toUpperCase()}\n`;
    response += `| ❃ ${categoryCommands.sort().join(" ❃ ")}\n`;
    const sentMessage = await message.reply(response);
    setTimeout(() => message.unsend(sentMessage.messageID), 40000);
}

async function searchCommands(message, searchWord, role) {
    const matchingCommands = [];
    commands.forEach((cmd, name) => {
        if (cmd.config.role <= role && name.includes(searchWord)) {
            if (!matchingCommands.includes(name)) matchingCommands.push(name);
        }
    });

    if (matchingCommands.length === 0) {
        return message.reply(`❌ No commands found matching '${searchWord}'.`);
    }

    let response = `🔎 Commands matching '${searchWord}':\n`;
    response += `| ❃ ${matchingCommands.sort().join(" ❃ ")}\n`;
    const sentMessage = await message.reply(response);
    setTimeout(() => message.unsend(sentMessage.messageID), 40000);
}

async function searchByAuthor(message, authorName, role) {
    const authorCommands = [];
    commands.forEach((cmd, name) => {
        if (cmd.config.role <= role && cmd.config.author?.toLowerCase() === authorName.toLowerCase()) {
            if (!authorCommands.includes(name)) authorCommands.push(name);
        }
    });

    if (authorCommands.length === 0) {
        return message.reply(`❌ No commands found by author '${authorName}'.`);
    }

    let response = `👑 Commands by Author: ${authorName}\n`;
    response += `| ❃ ${authorCommands.sort().join(" ❃ ")}\n`;
    const sentMessage = await message.reply(response);
    setTimeout(() => message.unsend(sentMessage.messageID), 70000);
}

function checkLangObject(data, langCode) {
    if (typeof data == "string") return data;
    if (typeof data == "object" && !Array.isArray(data)) return data[langCode] || data.en || undefined;
    return undefined;
}

function cropContent(content, max) {
    if (max && content.length > max) {
        content = content.slice(0, max - 3) + "...";
    }
    return content;
}
