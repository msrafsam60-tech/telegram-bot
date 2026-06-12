const TelegramBot = require("node-telegram-bot-api");

const TOKEN = process.env.BOT_TOKEN;
const ADMIN_GROUP_ID = process.env.ADMIN_GROUP_ID;

const bot = new TelegramBot(TOKEN, { polling: true });

const userMap = new Map();


// 👋 START MESSAGE
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;

    const sent = await bot.sendMessage(
        chatId,
        "👋 Welcome to RAFSAN SUPPORT TEAM\n\n" +
        "🙏 আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করার জন্য আপনাকে ধন্যবাদ।\n\n" +
        "💬 আপনি আপনার সমস্যাটি বিস্তারিত লিখে রাখুন।\n\n" +
        "⏳ আমাদের এডমিন খুব দ্রুত আপনার সাথে যোগাযোগ করে রিপ্লাই দিবে।\n\n" +
        "🙏 আবারও ধন্যবাদ আমাদের RAFSAN SUPPORT TEAM এর সাথে থাকার জন্য।\n\n" +
        "— RAFSAN SUPPORT TEAM 💙"
    );

    setTimeout(() => {
        bot.deleteMessage(chatId, sent.message_id);
    }, 5000);
});


// 💬 USER MESSAGE
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (String(chatId) === String(ADMIN_GROUP_ID)) return;
    if (!text || text.startsWith("/start")) return;

    try {
        const sent = await bot.sendMessage(chatId, "Message Send ✅");

        setTimeout(() => {
            bot.deleteMessage(chatId, sent.message_id);
        }, 3000);

        const adminMsg = await bot.sendMessage(
            ADMIN_GROUP_ID,
            `👤 Name: ${msg.from.first_name || "Unknown"}
🔗 Username: @${msg.from.username || "N/A"}
🆔 User ID: ${chatId}

💬 ${text}`
        );

        userMap.set(adminMsg.message_id, chatId);

    } catch (err) {
        console.log(err);
    }
});


// 🔁 REPLY SYSTEM
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;

    if (String(chatId) !== String(ADMIN_GROUP_ID)) return;

    if (msg.reply_to_message && msg.text) {
        const userId = userMap.get(msg.reply_to_message.message_id);

        if (userId) {
            await bot.sendMessage(userId, msg.text);
        }
    }
});


console.log("Bot Running...");
