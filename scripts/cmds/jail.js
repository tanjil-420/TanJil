const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
	config: {
		name: "jail",
		version: "1.1",
		author: "your love ( modified by TanJil )",
		countDown: 5,
		role: 0,
		shortDescription: "Jail image",
		longDescription: "Jail image",
		category: "funny",
		guide: "{pn} @mention | {pn} <uid> | {pn} <reply>"
	},

	langs: {
		vi: {
			noTag: "Bạn phải tag người bạn muốn tù"
		},
		en: {
			noTag: "tag the rapist"
		}
	},

	onStart: async function ({ event, message, usersData, args, getLang }) {
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

		if (!target) return message.reply(getLang("noTag"));

		const uid1 = event.senderID;
		const uid2 = target;

		const avatarURL1 = await usersData.getAvatarUrl(uid1);
		const avatarURL2 = await usersData.getAvatarUrl(uid2);

		const img = await new DIG.Jail().getImage(avatarURL2);
		const pathSave = `${__dirname}/tmp/${uid2}_Jail.png`;
		fs.writeFileSync(pathSave, Buffer.from(img));

		const content = args.join(' ').replace(target, "");
		message.reply({
			body: `${(content || "welcome rapist to jail😈")} 🚔`,
			attachment: fs.createReadStream(pathSave)
		}, () => fs.unlinkSync(pathSave));
	}
};
