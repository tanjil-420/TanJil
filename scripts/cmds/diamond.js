const fs = require('fs');
const path = require('path');

module.exports = {
    config: {
        name: "diamond",
        aliases: ["dm", "dia"],
        version: "2.0.0",
        author: "T A N J I L 🎀",
        role: 0,
        category: "game",
        description: "Manage virtual diamonds (View, Transfer, Admin Add/Delete)",
        guide: {
            en: "{pn} help: View commands\n{pn}: View your diamonds\n{pn} <@tag>: View user's diamonds\n{pn} transfer <@tag> <amount>: Transfer diamonds\n{pn} add <@tag> <amount>: (Admin) Add diamonds\n{pn} delete <@tag> <amount>: (Admin) Delete diamonds"
        }
    },

    onStart: async function ({ message, usersData, event, args, api }) {
        const { config } = global.GoatBot;
        const senderID = event.senderID;
        const adminIDs = Array.isArray(config.adminBot) ? config.adminBot : [config.adminBot];

        const { getData, setData } = require("../utils/dataStore");

        const getDiamond = async (uid) => {
            const data = await getData("diamond", uid);
            return Number(data.amount || 0);
        };

        const setDiamond = async (uid, amount) => {
            await setData("diamond", uid, {
                amount: Number(amount)
            });
        };

        const getUserName = async (uid) => {
            try {
                const data = await usersData.get(uid);
                return data?.name || "User";
            } catch {
                return "User";
            }
        };

        const formatDiamond = (num) => {
            const units = ["", "K", "M", "B", "T", "Q", "Qi", "Sx", "Sp", "Oc", "N", "D"];
            let unit = 0;
            let number = Number(num);

            while (number >= 1000 && unit < units.length - 1) {
                number /= 1000;
                unit++;
            }

            return `${number.toFixed(2)}${units[unit]}💎`;
        };

        const isValidAmount = (value) => {
            if (value === undefined || value === null) return false;

            const units = {
                k: 1e3,
                m: 1e6,
                b: 1e9,
                t: 1e12,
                q: 1e15,
                qi: 1e18,
                sx: 1e21,
                sp: 1e24,
                oc: 1e27,
                n: 1e30,
                d: 1e33
            };

            const match = String(value).toLowerCase().match(/^(\d+(?:\.\d+)?)(k|m|b|t|qi|q|sx|sp|oc|n|d)?$/);

            if (!match) return false;

            const number = parseFloat(match[1]);
            const unit = match[2] || "";

            return Number.isFinite(number) &&
                   number > 0 &&
                   Number.isFinite(number * (units[unit] || 1));
        };

        const parseAmount = (value) => {
            const units = {
                k: 1e3,
                m: 1e6,
                b: 1e9,
                t: 1e12,
                q: 1e15,
                qi: 1e18,
                sx: 1e21,
                sp: 1e24,
                oc: 1e27,
                n: 1e30,
                d: 1e33
            };

            const match = String(value).toLowerCase().match(/^(\d+(?:\.\d+)?)(k|m|b|t|qi|q|sx|sp|oc|n|d)?$/);

            if (!match) return 0;

            return parseFloat(match[1]) * (units[match[2] || ""] || 1);
        };

        const getTargetUID = () => {
            if (event.messageReply) {
                return event.messageReply.senderID;
            }

            if (event.mentions && Object.keys(event.mentions).length > 0) {
                return Object.keys(event.mentions)[0];
            }

            for (let i = 1; i < args.length; i++) {
                if (/^\d+$/.test(args[i])) {
                    return args[i];
                }
            }

            return null;
        };

        const getAmount = () => {
            for (let i = args.length - 1; i >= 1; i--) {
                if (isValidAmount(args[i])) {
                    return parseAmount(args[i]);
                }
            }

            return null;
        };

        const command = args[0]?.toLowerCase() || "";

        if (command === "help") {
            return message.reply(
                `💎 DIAMOND SYSTEM\n\n` +
                `💎 ${config.prefix}dm\n` +
                `View your diamonds\n\n` +
                `👤 ${config.prefix}dm @user\n` +
                `View another user's diamonds\n\n` +
                `🔁 ${config.prefix}dm transfer @user 500\n` +
                `Transfer diamonds\n\n` +
                `➕ ${config.prefix}dm add @user 500\n` +
                `Admin: Add diamonds\n\n` +
                `➖ ${config.prefix}dm delete @user 500\n` +
                `Admin: Remove diamonds`
            );
        }

        if (command === "add") {
            if (!adminIDs.includes(senderID)) {
                return message.reply("❌ You don't have permission to use this command.");
            }

            const targetUID = getTargetUID();
            const amount = getAmount();

            if (!targetUID) {
                return message.reply("❌ Please mention a user, reply to a user, or provide UID.");
            }

            if (!amount || amount <= 0) {
                return message.reply("❌ Please provide a valid diamond amount.");
            }

            const current = await getDiamond(targetUID);
            const newBalance = current + amount;

            await setDiamond(targetUID, newBalance);

            const name = await getUserName(targetUID);

            return message.reply(
                `✅ Diamonds Added\n\n` +
                `👤 User: ${name}\n` +
                `➕ Added: ${formatDiamond(amount)}\n` +
                `💎 Balance: ${formatDiamond(newBalance)}`
            );
        }

        if (command === "delete") {
            if (!adminIDs.includes(senderID)) {
                return message.reply("❌ You don't have permission to use this command.");
            }

            const targetUID = getTargetUID();
            const amount = getAmount();

            if (!targetUID) {
                return message.reply("❌ Please mention a user, reply to a user, or provide UID.");
            }

            if (!amount || amount <= 0) {
                return message.reply("❌ Please provide a valid diamond amount.");
            }

            const current = await getDiamond(targetUID);

            if (current < amount) {
                return message.reply(
                    `❌ Insufficient diamonds.\n💎 Current Balance: ${formatDiamond(current)}`
                );
            }

            const newBalance = current - amount;

            await setDiamond(targetUID, newBalance);

            const name = await getUserName(targetUID);

            return message.reply(
                `✅ Diamonds Removed\n\n` +
                `👤 User: ${name}\n` +
                `➖ Removed: ${formatDiamond(amount)}\n` +
                `💎 Balance: ${formatDiamond(newBalance)}`
            );
        }

        if (command === "transfer") {
            const targetUID = getTargetUID();
            const amount = getAmount();

            if (!targetUID) {
                return message.reply("❌ Please mention the receiver, reply to them, or provide UID.");
            }

            if (!amount || amount <= 0) {
                return message.reply("❌ Please provide a valid diamond amount.");
            }

            if (String(targetUID) === String(senderID)) {
                return message.reply("❌ You cannot transfer diamonds to yourself.");
            }

            const senderBalance = await getDiamond(senderID);

            if (senderBalance < amount) {
                return message.reply(
                    `❌ You don't have enough diamonds.\n` +
                    `💎 Your Balance: ${formatDiamond(senderBalance)}`
                );
            }

            const receiverBalance = await getDiamond(targetUID);

            await setDiamond(senderID, senderBalance - amount);
            await setDiamond(targetUID, receiverBalance + amount);

            const name = await getUserName(targetUID);

            return message.reply(
                `💎 DIAMOND TRANSFER\n\n` +
                `👤 Receiver: ${name}\n` +
                `💎 Amount: ${formatDiamond(amount)}\n` +
                `💰 Your Balance: ${formatDiamond(senderBalance - amount)}`
            );
        }

        let targetUID = senderID;

        if (event.messageReply) {
            targetUID = event.messageReply.senderID;
        } else if (event.mentions && Object.keys(event.mentions).length > 0) {
            targetUID = Object.keys(event.mentions)[0];
        } else if (/^\d+$/.test(command)) {
            targetUID = command;
        }

        const balance = await getDiamond(targetUID);
        const name = await getUserName(targetUID);

        return message.reply(
            `💎 DIAMOND BALANCE\n\n` +
            `👤 Name: ${name}\n` +
            `💎 Diamonds: ${formatDiamond(balance)}`
        );
    }
};
