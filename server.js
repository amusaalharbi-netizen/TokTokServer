const io = require("socket.io")(process.env.PORT || 3000);

// قائمة أسماء الأدمنز الثابتة
const ADMIN_NAMES = ["عبدالله", "عبدالعزيز"];

// إعدادات القنوات: القناة 69 محمية افتراضياً
let channelSettings = { "69": { pin: "1234", isLocked: true } };
let users = {}; 

console.log("Server is running...");

io.on("connection", (socket) => {
    console.log(`New user connected: ${socket.id}`);

    // 1. الانضمام للقناة
    socket.on("join_channel", (data) => {
        // حماية من البيانات الفارغة لمنع تعليق السيرفر
        if (!data || !data.channelId || data.channelId === "undefined") {
            console.log(`Rejected invalid join from ${socket.id}`);
            return;
        }

        const { channelId, pin, userName } = data;
        const isAdmin = ADMIN_NAMES.includes(userName);
        
        // التحقق من القفل (يستثني الأدمنز)
        if (channelSettings[channelId] && channelSettings[channelId].isLocked && !isAdmin) {
            if (pin !== channelSettings[channelId].pin) {
                socket.emit("error", "Wrong PIN");
                return;
            }
        }

        socket.join(channelId);
        users[socket.id] = { name: userName, channel: channelId, isAdmin: isAdmin };
        
        console.log(`User ${userName} joined channel: ${channelId} | Admin: ${isAdmin}`);
        emitUserList(channelId);
    });

    // 2. استقبال وبث الصوت
    socket.on("send_audio", (data) => {
        if (data && data.channelId && data.audio) {
            socket.to(data.channelId).emit("audio_data", {
                channelId: data.channelId,
                audio: data.audio
            });
        }
    });

    // 3. التحكم بالقفل (للأدمنز فقط)
    socket.on("toggle_lock", (data) => {
        const user = users[socket.id];
        if (!user || !user.isAdmin) return; 
        
        const { channelId, isLocked, pin } = data;
        channelSettings[channelId] = { pin, isLocked };
        io.to(channelId).emit("lock_status_changed", { isLocked });
        console.log(`Admin ${user.name} set channel ${channelId} locked: ${isLocked}`);
    });

    // 4. تحديث قائمة المستخدمين
    function emitUserList(channelId) {
        const list = Object.values(users)
            .filter(u => u.channel === channelId)
            .map(u => ({ name: u.name, isAdmin: u.isAdmin }));
        io.to(channelId).emit("channel_users_list", list);
    }

    // 5. الخروج
    socket.on("disconnect", () => {
        const user = users[socket.id];
        if (user) {
            delete users[socket.id];
            emitUserList(user.channel);
        }
    });
});