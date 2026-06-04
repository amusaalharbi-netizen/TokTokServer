const io = require("socket.io")(process.env.PORT || 3000);

const ADMIN_NAMES = ["عبدالله", "عبدالعزيز"];
let channelSettings = { "69": { pin: "1234", isLocked: true } };
let users = {}; 

io.on("connection", (socket) => {
    
    socket.on("join_channel", (data) => {
        // فحص ذكي: هل البيانات كائن (نسخة جديدة) أم رقم (نسخة قديمة)؟
        let channelId, userName;
        if (typeof data === 'object' && data !== null) {
            channelId = data.channelId;
            userName = data.userName;
        } else {
            channelId = data; 
            userName = "مستخدم"; // النسخة القديمة لا ترسل اسم
        }

        const isAdmin = ADMIN_NAMES.includes(userName);
        socket.join(channelId);
        users[socket.id] = { name: userName, channel: channelId, isAdmin: isAdmin };
        
        console.log(`User joined: ${userName} | Admin: ${isAdmin}`);
        emitUserList(channelId);
    });

    socket.on("send_audio", (data) => {
        // إذا كان البيانات كائن، استخرج القناة والصوت، إذا كانت قديمة (صوت فقط) فهي للقناة 69
        const channelId = (typeof data === 'object') ? data.channelId : "69";
        const audio = (typeof data === 'object') ? data.audio : data;

        if (channelId) {
            // بث الصوت للجميع في نفس القناة (يدعم القديم والجديد)
            socket.to(channelId).emit("audio_data", {
                channelId: channelId,
                audio: audio
            });
        }
    });

    socket.on("toggle_lock", (data) => {
        const user = users[socket.id];
        // إذا كان المستخدم لا يملك اسم، لا نعطيه أدمنية
        if (!user || !user.isAdmin) return;
        
        const { channelId, isLocked, pin } = data;
        channelSettings[channelId] = { pin, isLocked };
        io.to(channelId).emit("lock_status_changed", { isLocked });
    });

    function emitUserList(channelId) {
        const list = Object.values(users)
            .filter(u => u.channel === channelId)
            .map(u => ({ name: u.name, isAdmin: u.isAdmin }));
        io.to(channelId).emit("channel_users_list", list);
    }
});