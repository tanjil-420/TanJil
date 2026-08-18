const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
    config: {
        name: "help",
        version: "1.6.9",
        author: "Nazrul",
        countDown: 10,
        role: 0,
        usePrefix: true,
        shortDescription: "Search commands by category, author, or keyword.",
        description: "Displays all commands, allows searching by category, author, or specific words.",
        category: "general",
        guide: {
            en: "{pn} - Show all commands\n{pn} <command> - Command details\n{pn} category|c|-c|cat <name> - Commands in category\n{pn} search|sr|-s|find <word> - Search commands\n{pn} author|a|-a|by <name> - Commands by author"
        }
    },
    
    onStart: async function({ message, args, event, role }) {
        const prefix = getPrefix(event.threadID);
        
        if (!args[0]) {
            return sendCommandList(message, prefix, role);
        }
        
        const subCommand = args[0]?.toLowerCase();
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
        
        return sendCommandDetails(message, args[0].toLowerCase(), prefix);
    },
};

async function sendCommandList(message, prefix, role) {
    const categoryGroups = {
        "Ai & IMAGE": ["ai","ai music ","art", "gpt", "chatgpt", "ai assistant", "assistant", "ai image"],
        "image": ["image", "photo", "picture", "img", "imgs", "photos"],
        "MEDIA & VIDEO": ["media", "video", "auido", "music"],
        "GENERAL": ["general"],
        "BANKING": ["banking", "bank", "boney"],
        "FUN & GAMES": ["fun", "games", "game"],
        "SYSTEM & UTILITY": ["utility", "tools", "tool", "system"],
        "ADMIN": ["admin", "moderation", "owner", "noobs", "god"],
        "GROUP": ["group", "thread", "threads", "box", "box chat", "chatbox", "boxchat"]
    };
    
    const categorizedCommands = {};
    const othersCommands = [];

    commands.forEach((cmd, name) => {
        if (cmd.config.role > role) return;
        
        let assignedCategory = null;
       
        Object.entries(categoryGroups).forEach(([groupName, keywords]) => {
            if (keywords.includes(cmd.config.category?.toLowerCase())) {
                assignedCategory = groupName;
            }
        });
        
        if (assignedCategory) {
            if (!categorizedCommands[assignedCategory]) categorizedCommands[assignedCategory] = [];
            categorizedCommands[assignedCategory].push(name);
        } else {
            othersCommands.push(name);
        }
    });
    
    function formatCommands(commandsArray) {
        return commandsArray.map((cmd, i) => (i % 3 === 0 ? `\n| ❃ ` : " ❃ ") + cmd).join("");
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
    response += `👑 Owner: TanJil.4x🎀\n\n`;
    response += `Use '${prefix}help <cmdName>' for details.\n`;
    response += `Use '${prefix}help category/c/cat' for category search.\n`;
    response += `Use '${prefix}help search/sr/find' to search by keyword.\n`;
    response += `Use '${prefix}help author/a/by' to find commands by an author.\n`;
    
    const sentMessage = await message.reply(response);
    setTimeout(() => message.unsend(sentMessage.messageID), 60000);
}

async function sendCategoryCommands(message, categoryName, role) {
    const categoryGroups = {
        "AI & IMAGE": ["ai","ai music ","art", "gpt", "chatgpt", "ai assistant", "assistant", "ai image"],
        "image": ["image", "photo", "picture", "img", "imgs", "photos"],
        "MEDIA & VIDEO": ["media", "video", "auido", "music"],
        "GENERAL": ["general"],
        "BANKING": ["banking", "bank", "boney"],
        "FUN & GAMES": ["fun", "games", "game"],
        "SYSTEM & UTILITY": ["utility", "tools", "tool", "system"],
        "ADMIN": ["admin", "moderation", "owner", "noobs", "god"],
        "GROUP": ["group", "thread", "threads", "box", "box chat", "chatbox", "boxchat"]
    };
    
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
            if (assignedCategory === categoryName || matchedCategory === categoryName) {
                categoryCommands.push(name);
            }
        }
    });
    
    if (categoryCommands.length === 0) {
        return message.reply(`❌ No commands found in category '${categoryName}'.`);
    }
    
    let response = `📜 Commands in Category: ${matchedCategory.toUpperCase()}\n`;
    response += `| ❃ ${categoryCommands.join(" ❃ ")}\n`;
    
    const sentMessage = await message.reply(response);
    setTimeout(() => message.unsend(sentMessage.messageID), 40000);
}

async function searchCommands(message, searchWord, role) {
    const matchingCommands = [];
    commands.forEach((cmd, name) => {
        if (cmd.config.role <= role && name.includes(searchWord)) {
            matchingCommands.push(name);
        }
    });
    
    if (matchingCommands.length === 0) {
        return message.reply(`❌ No commands found matching '${searchWord}'.`);
    }
    
    let response = `🔎 Commands matching '${searchWord}':\n`;
    response += `| ❃ ${matchingCommands.join(" ❃ ")}\n`;
    
    const sentMessage = await message.reply(response);
    setTimeout(() => message.unsend(sentMessage.messageID), 40000);
}

async function searchByAuthor(message, authorName, role) {
    const authorCommands = [];
    commands.forEach((cmd, name) => {
        if (cmd.config.role <= role && cmd.config.author?.toLowerCase() === authorName.toLowerCase()) {
            authorCommands.push(name);
        }
    });
    
    if (authorCommands.length === 0) {
        return message.reply(`❌ No commands found by author '${authorName}'.`);
    }
    
    let response = `👑 Commands by Author: ${authorName}\n`;
    response += `| ❃ ${authorCommands.join(" ❃ ")}\n`;
    
    const sentMessage = await message.reply(response);
    setTimeout(() => message.unsend(sentMessage.messageID), 70000);
}

async function sendCommandDetails(message, commandName, prefix) {
    const command = commands.get(commandName) || commands.get(aliases.get(commandName));
    if (!command) {
        return message.reply(`❌ Command "${commandName}" not found.`);
    }
    
    const configCommand = command.config;
    const roleText = roleTextToString(configCommand.role);
    const author = configCommand.author || "Unknown";
    const Description = configCommand.description || configCommand.Description || "No Description Available";
    const usePrefix = usePrefixOk(configCommand.usePrefix);
    const isPremium = isPremiumOk(configCommand.isPremium);
    const requiredMoney = MoneyOk(configCommand.requiredMoney);
    const shortDescription = configCommand.shortDescription || "No short description available.";
    const usage = (configCommand.guide?.en || configCommand.guide || "No guide available.")
    .replace(/{pn}/g, prefix + toFancy(configCommand.name))
    .replace(/{p}/g, prefix)
    .replace(/{n}/g, toFancy(configCommand.name));
    
    let msg = `•×🎀 𝐂𝐨𝐦𝐦𝐚𝐧d 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧!\n\n`;
    msg += `🛠️ 𝐍𝐚𝐦𝐞: ${configCommand.name}\n`;
    msg += `•× 𝐀𝐥𝐢𝐚𝐬𝐞𝐬: ${configCommand.aliases ? configCommand.aliases.join(", ") : "None"}\n`;
    msg += `•× 𝐕𝐞𝐫𝐬𝐢𝐨𝐧: ${configCommand.version}\n`;
    msg += `•× 𝐀𝐮𝐭𝐡𝐨𝐫: ${author}\n`;
    msg += `•× 𝐑𝐨𝐥𝐞: ${roleText}\n`;
    msg += `•× 𝐮𝐬𝐞𝐏𝐫𝐞𝐟𝐢𝐱: ${usePrefix}\n`;
    msg += `•× 𝐢𝐬𝐏𝐫𝐞𝐦𝐢𝐮𝐦: ${isPremium}\n`;
    msg += `•× 𝐫𝐞𝐪𝐮𝐢𝐫𝐞d𝐌𝐨𝐧𝐞𝐲: ${requiredMoney}\n`;
    msg += `•× 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐲: ${configCommand.category}\n`;
    msg += `•× 𝐃𝐞𝐬𝐜𝐫𝐢𝐩𝐭𝐢𝐨𝐧: ${Description}\n`;
    msg += `•× 𝐆𝐮𝐢d𝐞: ${usage}\n`;
    msg += `•× 𝐂𝐨𝐨𝐥𝐃𝐨𝐰𝐧𝐬: ${configCommand.countDown} seconds\n`;
    
    const sentMessage = await message.reply(msg);
    setTimeout(() => message.unsend(sentMessage.messageID), 70000);
}

function roleTextToString(role) {
  return role === 0 ? "Everyone" : role === 1 ? "Group Admins" : "Bot Admins";
}

function isPremiumOk(isPremium) {
  return isPremium === false ? "Free to use" : isPremium === true ? "Yes" : "Free!!"
};

function usePrefixOk(usePrefix) {
  return usePrefix === false ? "No Need!" : usePrefix === true ? "Required!" : "Required"
};

function MoneyOk(requiredMoney) {
  if (requiredMoney === 0 || requiredMoney === false) return "Free!!";
  if (requiredMoney === true) return "Money required";
  if (typeof requiredMoney === "number") return requiredMoney;
  return 500;
};

function toFancy(text) {
    const map = {
        A: "𝐀", B: "𝐁", C: "𝐂", D: "𝐃", E: "𝐄", F: "𝐅", G: "𝐆", H: "𝐇", I: "𝐈", J: "𝐉",
        K: "𝐊", L: "𝐋", M: "𝐌", N: "𝐍", O: "𝐎", P: "𝐏", Q: "𝐐", R: "𝐑", S: "𝐒", T: "𝐓",
        U: "𝐔", V: "𝐕", W: "𝐖", X: "𝐗", Y: "𝐘", Z: "𝐙",
        a: "𝐚", b: "𝐛", c: "𝐜", d: "𝐝", e: "𝐞", f: "𝐟", g: "𝐠", h: "𝐡", i: "𝐢", j: "𝐣",
        k: "𝐤", l: "𝐥", m: "𝐦", n: "𝐧", o: "𝐨", p: "𝐩", q: "𝐪", r: "𝐫", s: "𝐬", t: "𝐭",
        u: "𝐮", v: "𝐯", w: "𝐰", x: "𝐱", y: "𝐲", z: "𝐳",
        0: "𝟎", 1: "𝟏", 2: "𝟐", 3: "𝟑", 4: "𝟒", 5: "𝟓", 6: "𝟔", 7: "𝟕", 8: "𝟖", 9: "𝟗"
    };
    return text.split("").map(ch => map[ch] || ch).join("");
};
