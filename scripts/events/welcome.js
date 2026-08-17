const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
    global.temp.welcomeEvent = {};

module.exports = {
    config: {
        name: "welcome",
        version: "1.7",
        author: "NTKhang",
        category: "events"
    },
    langs: {
        en: {
            welcomeMessage: `🎀 Thanks for adding me to your group!\n\n✵ Prefix: %1\n✵ Owner: %2\n\n✵ To get started, type: [%1help]\n\nI'm here to assist, entertain, and keep things running smoothly. Let's make this group awesome!`,
            defaultWelcomeMessage: `Hey, {userNames}, welcome for joining this chat,\n• Group: {boxName}\n• {theyre} the {memberCounts} member!\n\n• Added At: {date} ( {time} )\n• Added by: {authorName}`
        }
    },

    onStart: async ({ threadsData, message, event, api, getLang, usersData }) => {
        if (event.logMessageType == "log:subscribe") {
            const { threadID, author } = event;
            const { nickNameBot } = global.GoatBot.config;
            const prefix = global.utils.getPrefix(threadID);
            const dataAddedParticipants = event.logMessageData.addedParticipants;

            if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
                if (nickNameBot)
                    api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
                
                const ownerID = (global.GoatBot.config.main_admin);
                let ownerName = "Nazrul";
                
                if (ownerID && usersData) {
                    try {
                        const ownerData = await usersData.get(ownerID);
                        ownerName = ownerData.name || "Nazrul";
                    } catch (e) {
                        console.error("Error getting owner data:", e);
                    }
                }
                
                return message.send(getLang("welcomeMessage", prefix, ownerName));
            }

            const threadData = await threadsData.get(threadID);
            if (threadData.settings.sendWelcomeMessage == false)
                return;

            const dataBanned = threadData.data.banned_ban || [];
            const threadName = threadData.threadName;
            const currentMembers = threadData.members || [];
            const currentMemberCount = currentMembers.length;
            const userName = [],
                mentions = [];

            for (const user of dataAddedParticipants) {
                if (dataBanned.some((item) => item.id == user.userFbId))
                    continue;
                userName.push(user.fullName);
                mentions.push({
                    tag: user.fullName,
                    id: user.userFbId
                });
            }

            if (userName.length == 0) return;

            let authorName = "Unknown";
            let authorInfo = "Unknown";
            if (author) {
                try {
                    const userInfo = await api.getUserInfo(author);
                    authorName = userInfo[author]?.name || "Unknown";
                    authorInfo = `${authorName} (${author})`;
                } catch (e) {
                    authorName = "Unknown";
                    authorInfo = `Unknown (${author})`;
                }
            }

            let date, time;
            try {
                const moment = require('moment-timezone');
                const bdTime = moment().tz('Asia/Dhaka');
                date = bdTime.format('DD/MMM/YYYY');
                time = bdTime.format('h:mm A');
            } catch (error) {
                const now = new Date();
                const day = String(now.getDate()).padStart(2, '0');
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const month = monthNames[now.getMonth()];
                const year = now.getFullYear();
                const hours = now.getHours();
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const displayHours = hours % 12 || 12;
                date = `${day}/${month}/${year}`;
                time = `${displayHours}:${minutes} ${ampm}`;
            }

            function getNumberSuffix(num) {
                if (num % 100 >= 11 && num % 100 <= 13) return 'th';
                switch (num % 10) {
                    case 1: return 'st';
                    case 2: return 'nd';
                    case 3: return 'rd';
                    default: return 'th';
                }
            }

            const startingPosition = currentMemberCount + 1;

            console.log(`•× NEW MEMBER(S) ADDED`);
            console.log(`• Group: ${threadName}`);
            console.log(`• Group ID: ${threadID}`);
            console.log(`• Added by: ${authorInfo}`);
            console.log(`• Date: ${date} (${time})`);
            console.log(`• Current members: ${currentMemberCount}`);
            console.log(`• New total after adding: ${currentMemberCount + dataAddedParticipants.length}`);
       
            console.log(`• New Member(s):`);
            for (let i = 0; i < userName.length; i++) {
                const user = dataAddedParticipants[i];
                const memberPosition = startingPosition + i;
                console.log(`   ${i + 1}. ${userName[i]} (${user.userFbId}) - Position: ${memberPosition}${getNumberSuffix(memberPosition)}`);
            }

            const messageMentions = [...mentions];
            
            if (author && authorName !== "Unknown") {
                messageMentions.push({
                    tag: authorName,
                    id: author
                });
            }

            let welcomeMessage = getLang("defaultWelcomeMessage");
            
            const userNamesString = userName.map(name => `${name}`).join(", ");
            
            const memberCountsArray = [];
            for (let i = 0; i < userName.length; i++) {
                const memberPosition = startingPosition + i;
                const memberPositionSuffix = getNumberSuffix(memberPosition);
                memberCountsArray.push(`${memberPosition}${memberPositionSuffix}`);
            }
            const memberCountsString = memberCountsArray.join(", ");
            
            const theyre = userName.length > 1 ? "they're" : "you're";
            
            welcomeMessage = welcomeMessage
                .replace(/\{userNames\}/g, userNamesString)
                .replace(/\{theyre\}/g, theyre)
                .replace(/\{boxName\}|\{threadName\}/g, threadName)
                .replace(/\{memberCounts\}/g, memberCountsString)
                .replace(/\{date\}/g, date)
                .replace(/\{time\}/g, time)
                .replace(/\{authorName\}/g, authorName !== "Unknown" ? `${authorName}` : "Unknown");

            const form = {
                body: welcomeMessage,
                mentions: messageMentions
            };

            if (threadData.data.welcomeAttachment) {
                const files = threadData.data.welcomeAttachment;
                const attachments = [];
                for (const file of files) {
                    try {
                        const attachment = await drive.getFile(file, "stream");
                        attachments.push(attachment);
                    } catch (fileError) { }
                }
                if (attachments.length > 0) {
                    form.attachment = attachments;
                }
            }

            try {
                await api.sendMessage(form, threadID);
            } catch (sendError) { 
                console.error("Error sending welcome message:", sendError);
            }
        }
    }
}