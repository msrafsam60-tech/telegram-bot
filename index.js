const TelegramBot = require("node-telegram-bot-api");

const TOKEN = process.env.BOT_TOKEN;
const ADMIN_GROUP_ID = process.env.ADMIN_GROUP_ID;

const bot = new TelegramBot(TOKEN, {
    polling: true
});

// user mapping (reply system এর জন্য)
const userMap = new Map();

// /start message
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;

    await bot.sendMessage(
        chatId,
        "👋 Welcome!\n\nআমরা আপনাকে ২৪ ঘন্টা সাপোর্ট দেওয়ার জন্য আছি।\nআপনার সমস্যা লিখুন।"
    );
});

// user message handler
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // ignore admin group messages
    if (String(chatId) === String(ADMIN_GROUP_ID)) return;

    if (!text || text.startsWith("/start")) return;

    try {
        // get user profile photo
        let photoUrl = "No Photo";

        try {
            const photos = await bot.getUserProfilePhotos(chatId, 0, 1);
            if (photos.total_count > 0) {
                const fileId = photos.photos[0][0].file_id;
                const fileLink = await bot.getFileLink(fileId);
                photoUrl = fileLink;
            }
        } catch (e) {}

        // send status to user
        const sent = await bot.sendMessage(chatId, "Message Send ✅");

        setTimeout(() => {
            bot.deleteMessage(chatId, sent.message_id);
        }, 5000);

        // send to admin group
        const adminMsg = await bot.sendMessage(
            ADMIN_GROUP_ID,
            `📩 NEW SUPPORT REQUEST

👤 Name: ${msg.from.first_name || "Unknown"}
🔗 Username: @${msg.from.username || "N/A"}
🆔 User ID: ${chatId}
🖼 Photo: ${photoUrl}

💬 Message: ${text}
            
👉 Reply this message to answer user`
        );

        // save mapping (admin reply system)
        userMap.set(adminMsg.message_id, chatId);

    } catch (err) {
        console.log(err);
    }
});

// admin reply system
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;

    // only admin group
    if (String(chatId) !== String(ADMIN_GROUP_ID)) return;

    // check reply
    if (msg.reply_to_message) {
        const repliedId = msg.reply_to_message.message_id;
        const userId = userMap.get(repliedId);

        if (userId) {
            await bot.sendMessage(userId, `💬 Support Reply:\n\n${msg.text}`);
        }
    }
});

console.log("Bot Running...");
