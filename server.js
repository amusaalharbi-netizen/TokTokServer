const io = require("socket.io")(process.env.PORT || 3000);

// قاعدة بيانات مؤقتة لتخزين بيانات المستخدمين وحالة القنوات
let users = {}; 
let channelPins = { "1234": "1111" }; // مثال: القناة 1234 رمزها 1111

console.log("Server is running on port 3000...");

io.on("connection", (socket) => {
    console.log(`New user connected: ${socket.id}`);

    // تسجيل بيانات المستخدم (الاسم، البطارية)
    socket.on("register_user", (userData) => {
        users[socket.id] = { ...userData, status: 'online' };
        io.emit("user_list_updated", users);
    });

    // الانضمام لقناة مع التحقق من الـ PIN
    socket.on("join_channel", (data) => {
        const { channelId, pin } = data;
        
        // التحقق من الـ PIN إذا كانت القناة محمية
        if (channelPins[channelId] && channelPins[channelId] !== pin) {
            socket.emit("error", "Invalid PIN");
            return;
        }

        socket.join(channelId);
        console.log(`User ${socket.id} joined channel: ${channelId}`);
    });

    // تحديث نسبة البطارية
    socket.on("update_battery", (level) => {
        if (users[socket.id]) {
            users[socket.id].battery = level;
            socket.broadcast.emit("battery_update", { id: socket.id, level });
        }
    });

    // إرسال الصوت مع كشف المتحدث النشط
    socket.on("send_audio", (data) => {
        if (data && data.channelId && data.audio) {
            // إبلاغ القناة بأن هذا المستخدم يتحدث الآن
            io.to(data.channelId).emit("speaker_active", { userId: socket.id });
            
            // بث الصوت
            socket.to(data.channelId).emit("audio_data", {
                channelId: data.channelId,
                audio: data.audio
            });
        }
    });

    socket.on("disconnect", () => {
        delete users[socket.id];
        io.emit("user_list_updated", users);
        console.log(`User disconnected: ${socket.id}`);
    });
});