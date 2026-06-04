const io = require("socket.io")(process.env.PORT || 3000);

let users = {}; // تخزين حالة المستخدمين
let channelPins = { "69": "1234" }; // مثال: القناة 69 رمزها 1234

console.log("Server is running...");

io.on("connection", (socket) => {
    
    // الانضمام للقناة (يدعم النسخة القديمة والجديدة)
    socket.on("join_channel", (data) => {
        let channelId, pin, userName;

        if (typeof data === 'object' && data !== null) {
            channelId = data.channelId;
            pin = data.pin;
            userName = data.userName;
        } else {
            channelId = data; // دعم النسخة القديمة
            pin = null;
            userName = "مستخدم";
        }

        if (!channelId || channelId === "undefined") return;

        // التحقق من القفل (فقط للنسخ التي تدعم الـ PIN)
        if (channelPins[channelId] && channelPins[channelId] !== pin) {
            socket.emit("error", "Wrong PIN");
            return;
        }

        socket.join(channelId);
        users[socket.id] = { name: userName, channel: channelId };
        console.log(`User ${userName} joined channel: ${channelId}`);
    });

    // استقبال وبث الصوت (يدعم التنسيقين القديم والجديد)
    socket.on("send_audio", (data) => {
        const channelId = (typeof data === 'object') ? data.channelId : "69";
        const audio = (typeof data === 'object') ? data.audio : data;

        if (channelId && channelId !== "undefined" && audio) {
            socket.to(channelId).emit("audio_data", {
                channelId: channelId,
                audio: audio
            });
            console.log(`Audio broadcasted to: ${channelId}`);
        }
    });

    socket.on("disconnect", () => {
        delete users[socket.id];
    });
});