const math = require('mathjs');

module.exports = {
  config: {
    name: "calc",
    aliases: ["calculate", "calculator", "math"],
    description: "A smart calculator that gives direct answers to any math expression!",
    usage: "/calc <expression>",
    category: "tools",
    cooldown: 2,
    role: 0,
    author: "T A N J I L 🎀",
    shortDescription: {
      en: "Smart calculator for all math expressions!"
    },
    longDescription: {
      en: "Use /calc followed by a mathematical expression to get instant results like a real calculator."
    },
    guide: {
      en: `
✪ Smart Calculator Guide ✪

➤ Description:
Solve math expressions instantly using this smart calculator command.

➤ Usage:
• /calc <expression>

➤ Examples:
• /calc 2+2
• /calc 5*8-3
• /calc (12/4) + 3^2
• /calc sqrt(25)
• /calc 3^3

➤ Supported Operations:
• Addition (+), Subtraction (-)
• Multiplication (*), Division (/)
• Exponents (^), Square roots (sqrt)
• Brackets for priority ( )
• Decimals are also supported (e.g., 3.5 + 2.1)

➤ Notes:
• Make sure to type valid math expressions.
• You can use functions like: sqrt(), sin(), cos(), log(), etc.

Enjoy smart math solving!
      `
    }
  },

  onStart: async function ({ api, event, args }) {
    const expression = args.join(" ");
    if (!expression) {
      return api.sendMessage("❌ Please enter a math expression.\n\nExample: /calc (3+5)*2", event.threadID, event.messageID);
    }

    try {
      const result = math.evaluate(expression);
      return api.sendMessage(`🧮 Result: ${result}`, event.threadID, event.messageID);
    } catch (error) {
      return api.sendMessage("❌ Invalid expression. Please try again.\nExample: /calc sqrt(16)+4", event.threadID, event.messageID);
    }
  }
};
