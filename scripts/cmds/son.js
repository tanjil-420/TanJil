module.exports.config = {
    name: "son",
    category: "media",
    author: "Romim×BaYjid",
    role: 2,
    shortDescription: "মেনশন করা ইউজারকে গালি দেয় / বন্ধ করে",
    usage: ".son @user | .son off @user | .son info",
};

const userResponses = {};

module.exports.onStart = async function({ api, event }) {
    const args = event.body.trim().split(/\s+/).slice(1); // কমান্ডের পরের অংশ
    const subCommand = args[0];

    if (subCommand === "info") {
        return api.sendMessage(
            "💡 .son @user  => মেনশনকৃত ইউজারকে গালি দেওয়া শুরু করবে\n" +
            "💡 .son off @user => মেনশনকৃত ইউজারের জন্য গালি বন্ধ করবে\n" +
            "💡 .son info => এই ইনফো দেখাবে", 
            event.threadID
        );
    }

    const mentionIDs = Object.keys(event.mentions);

    if (mentionIDs.length === 0) {
        return api.sendMessage("❌ দয়া করে কাকে চুদতে চাও তারে ম্যানশন করো!", event.threadID);
    }

    const mention = mentionIDs[0];

    // যদি "off" সাবকমান্ড হয় তাহলে গালি বন্ধ করো
    if (subCommand === "off") {
        if (userResponses[mention] && userResponses[mention].active) {
            userResponses[mention].active = false;
            return api.sendMessage(`✅ ${event.mentions[mention]} কে চুদা বন্ধ করা হলো`, event.threadID);
        } else {
            return api.sendMessage(`❌ ${event.mentions[mention]} এর জন্য কোনো গালি চালু নেই।`, event.threadID);
        }
    }

    // অন্য ক্ষেত্রে (সাধারণ son কমান্ড)
    api.getUserInfo(mention, async (err, userInfo) => {
        if (err) {
            console.error("⚠️ ইউজারের তথ্য আনতে সমস্যা:", err);
            return api.sendMessage("❌ ইউজারের তথ্য আনতে ব্যর্থ!", event.threadID);
        }

        let genderText;
        switch (userInfo[mention].gender) {
            case 1:
                genderText = "মাইয়া";
                break;
            case 2:
                genderText = "পোলা";
                break;
            default:
                genderText = "হিজড়া";
        }

        const insults = [
            `খাংকির ${genderText}, তোর মার ভোদা তে গাধার মাল ফালাবো! 😈`,
            `তোর মা কে চুদে চুদে পল্টি মারবো, গাধার ${genderText}! 😡`,
            `বাড়ির পাশে আমার মাল ফেলে দিয়ে তোর মা কে চুদতে চাই! 🔥`,
            `চুদা খাওয়া তোর মার, আমি তোর মার ভোদায় টান দিবো! 💣`,
            `তোর মার গুদে ফুল ট্যাবলেট পুশ করে, গাধার ${genderText}! 😛`,
            `তোর বোনের মুখে মাল ফালানোর কথা ভাবি, মাগী ${genderText}!`,
            `তোর মাকে গাধার মতো চুদে তোর মা বলব "এটা কার মাল?"`,
            `তোর মার গুদে ইনপুট দিয়ে আউটপুট নেবো, পোলাপাইন ${genderText}!`,
            `তোর মার ভোদায় গাধার মতো মাল ফালিয়ে দেবো, আজকের রাতেই! 🔥`,
            `এখন মাগীর ${genderText} তোর মার ভোদা চুদে, এক টুকরা দেবো! 😠`,
            `তোর মা কে চুদে পল্টি মারবো, গাধার ${genderText}! 🤡`,
        ];

        if (!userResponses[mention]) {
            userResponses[mention] = { index: 0, active: true };
        } else {
            userResponses[mention].active = true; // আবার চালু করো যদি আগে বন্ধ থাকে
        }

        if (userResponses[mention].active) {
            api.sendMessage(`😆 কিরে ${event.mentions[mention]}! কেমন আছিস..?`, event.threadID);
        } else {
            return api.sendMessage(`❌ ${event.mentions[mention]} এর জন্য গালি বন্ধ আছে।`, event.threadID);
        }

        // MQTT লিসেনার যোগ করবো কিন্তু শুধু active হলে কাজ করবে
        api.listenMqtt((err, message) => {
            if (err) {
                console.error("⚠️ MQTT Listener Error:", err);
                return;
            }
            if (message.senderID === mention && message.body && userResponses[mention] && userResponses[mention].active) {
                const currentIndex = userResponses[mention].index;
                api.sendMessage(insults[currentIndex % insults.length], message.threadID, message.messageID);
                userResponses[mention].index++;
            }
        });
    });
};
