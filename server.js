const io = require("socket.io")(process.env.PORT || 3000);

// قاعدة بيانات مؤقتة لتخزين بيانات المستخدمين النشطين
let users = {}; 
// قائمة القنوات المحمية بـ PIN (مثال للقناة 69 رمزها 1234)
let channelPins = { "69": "1234" }; 

console.log("Server is running on port 3000...");

io.on("connection", (socket) => {
    console.log(`New user connected: ${socket.id}`);

    // الانضمام لقناة مع التحقق من الـ PIN والاسم
    socket.on("join_channel", (data) => {
        const { channelId, pin, userName } = data;
        
        // 1. التحقق من صحة رقم القناة
        if (!channelId || channelId === "undefined" || channelId.trim() === "") {
            return;
        }

        // 2. التحقق من الـ PIN إذا كانت القناة محمية
        if (channelPins[channelId] && channelPins[channelId] !== pin) {
            socket.emit("error", "Wrong PIN");
            return;
        }

        // 3. تسجيل دخول المستخدم في السيرفر وتحديد قناته
        socket.join(channelId);
        users[socket.id] = { name: userName, channel: channelId };
        console.log(`User ${userName} joined channel: ${channelId}`);

        // 4. إرسال قائمة الأسماء المحدثة لكل من في القناة
        updateChannelUserList(channelId);
    });

    // إرسال الصوت مع كشف المتحدث النشط
    socket.on("send_audio", (data) => {
        if (data && data.channelId && data.channelId !== "undefined" && data.audio) {
            // إبلاغ القناة بأن هذا المستخدم يتحدث الآن
            io.to(data.channelId).emit("speaker_active", { userId: socket.id });
            
            // بث الصوت للمشتركين في نفس القناة فقط
            socket.to(data.channelId).emit("audio_data", {
                channelId: data.channelId,
                audio: data.audio
            });
        }
    });

    // دالة لتحديث قائمة الأسماء في القناة
    function updateChannelUserList(channelId) {
        const usersInChannel = Object.values(users)
            .filter(u => u.channel === channelId)
            .map(u => u.name);
        io.to(channelId).emit("channel_users_list", usersInChannel);
    }

    socket.on("disconnect", () => {
        const user = users[socket.id];
        if (user) {
            const channelId = user.channel;
            delete users[socket.id];
            // تحديث القائمة بعد خروج الشخص
            updateChannelUserList(channelId);
            console.log(`User ${user.name} disconnected`);
        }
    });
});