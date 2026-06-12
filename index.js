const TelegramBot = require("node-telegram-bot-api");

// Railway Environment Variables থেকে নেবে
const TOKEN = process.env.BOT_TOKEN;
const ADMIN_GROUP_ID = process.env.ADMIN_GROUP_ID;

// Bot start (polling mode)
const bot = new TelegramBot(TOKEN, {
    polling: true
});

// সব মেসেজ ধরবে
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;

    // Admin group-এর মেসেজ ignore করবে
    if (String(chatId) === String(ADMIN_GROUP_ID)) return;

    try {
        // ইউজারকে স্ট্যাটাস দেখাবে
        const sent = await bot.sendMessage(chatId, "Message Send ✅");

        // ৫ সেকেন্ড পরে ডিলিট
        setTimeout(() => {
            bot.deleteMessage(chatId, sent.message_id);
        }, 5000);

        // Admin group-এ পাঠাবে
        await bot.sendMessage(
            ADMIN_GROUP_ID,
            `👤 User ID: ${chatId}\n💬 Message: ${msg.text || "No Text"}`
        );

    } catch (err) {
        console.log(err);
    }
});

console.log("Bot Running...");
