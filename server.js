const io = require("socket.io")(process.env.PORT || 3000);

let users = {}; 
let channelPins = { "69": "1234" }; 

console.log("Server is running on port 3000...");

io.on("connection", (socket) => {
    
    socket.on("join_channel", (data) => {
        // دعم النسخ القديمة والجديدة:
        // إذا كان data مجرد رقم (string) فهو من نسخة قديمة
        // إذا كان data كائن (object) فهو من نسخة جديدة
        let channelId, pin, userName;
        
        if (typeof data === 'object') {
            channelId = data.channelId;
            pin = data.pin;
            userName = data.userName;
        } else {
            channelId = data; // النسخة القديمة ترسل الرقم فقط
            pin = null;
            userName = "مستخدم";
        }

        if (!channelId || channelId === "undefined") return;

        // التحقق من القفل (فقط للنسخ الجديدة التي تدعم الـ PIN)
        if (channelPins[channelId] && channelPins[channelId] !== pin) {
            socket.emit("error", "Wrong PIN");
            return;
        }

        socket.join(channelId);
        users[socket.id] = { name: userName || "مستخدم", channel: channelId };
        
        // تحديث القائمة لكل من في القناة
        updateChannelUserList(channelId);
    });

    socket.on("send_audio", (data) => {
        // التوافق العكسي: التعامل مع البيانات سواء كانت بتنسيق قديم أو جديد
        const targetChannel = data.channelId || data; 
        const audioData = data.audio || data;

        if (targetChannel && targetChannel !== "undefined") {
            socket.to(targetChannel).emit("audio_data", {
                channelId: targetChannel,
                audio: audioData
            });
        }
    });

    function updateChannelUserList(channelId) {
        const usersInChannel = Object.values(users)
            .filter(u => u.channel === channelId)
            .map(u => u.name);
        io.to(channelId).emit("channel_users_list", usersInChannel);
    }

    socket.on("disconnect", () => {
        const user = users[socket.id];
        if (user) {
            delete users[socket.id];
            updateChannelUserList(user.channel);
        }
    });
});