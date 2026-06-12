const TelegramBot = require("node-telegram-bot-api");

const TOKEN = process.env.BOT_TOKEN;
const ADMIN_GROUP_ID = process.env.ADMIN_GROUP_ID;

const bot = new TelegramBot(TOKEN, { polling: true });

// reply mapping
const userMap = new Map();


// /start message
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;

    const sent = await bot.sendMessage(
        chatId,
        "👋 Welcome!\n\nআমরা আপনাকে ২৪ ঘন্টা সাপোর্ট দেওয়ার জন্য আছি।\nআপনার সমস্যা লিখুন।"
    );

    setTimeout(() => {
        bot.deleteMessage(chatId, sent.message_id);
    }, 5000);
});


// USER MESSAGE HANDLER
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (String(chatId) === String(ADMIN_GROUP_ID)) return;
    if (!text || text.startsWith("/start")) return;

    try {
        // user status message
        const sent = await bot.sendMessage(chatId, "Message Send ✅");

        setTimeout(() => {
            bot.deleteMessage(chatId, sent.message_id);
        }, 3000);

        // send to admin group
        const adminMsg = await bot.sendMessage(
            ADMIN_GROUP_ID,
            `📩 NEW MESSAGE

👤 Name: ${msg.from.first_name || "Unknown"}
🔗 Username: @${msg.from.username || "N/A"}
🆔 User ID: ${chatId}

💬 Message:
${text}

👉 Reply this message to answer`
        );

        // map message id for reply system
        userMap.set(adminMsg.message_id, chatId);

    } catch (err) {
        console.log(err);
    }
});


// ADMIN REPLY SYSTEM
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;

    if (String(chatId) !== String(ADMIN_GROUP_ID)) return;

    if (msg.reply_to_message && msg.text) {
        const repliedId = msg.reply_to_message.message_id;
        const userId = userMap.get(repliedId);

        if (userId) {
            await bot.sendMessage(userId, `${msg.text}`);
        }
    }
});


console.log("Bot Running...");
