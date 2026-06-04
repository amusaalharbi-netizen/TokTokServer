const io = require("socket.io")(process.env.PORT || 3000);

// قائمة أسماء الأدمنز الثابتة
const ADMIN_NAMES = ["عبدالله", "عبدالعزيز"];

let users = {}; 
let channelSettings = { "69": { pin: "1234", isLocked: true } };

console.log("Server is running...");

io.on("connection", (socket) => {
    
    socket.on("join_channel", (data) => {
        const { channelId, pin, userName } = data;
        
        // التحقق مما إذا كان المستخدم أدمن بناءً على اسمه
        const isAdmin = ADMIN_NAMES.includes(userName);
        
        // التحقق من القفل (الأدمنز يتخطون القفل)
        if (channelSettings[channelId] && channelSettings[channelId].isLocked && !isAdmin) {
            if (pin !== channelSettings[channelId].pin) {
                socket.emit("error", "Wrong PIN");
                return;
            }
        }

        socket.join(channelId);
        users[socket.id] = { name: userName, channel: channelId, isAdmin: isAdmin };
        
        console.log(`User ${userName} joined. IsAdmin: ${isAdmin}`);
        emitUserList(channelId);
    });

    // تحكم الأدمن فقط (قفل وفتح القناة)
    socket.on("toggle_lock", (data) => {
        const user = users[socket.id];
        if (!user || !user.isAdmin) return; // منع أي شخص ليس اسمه عبدالله أو عبدالعزيز
        
        const { channelId, isLocked, pin } = data;
        channelSettings[channelId] = { pin, isLocked };
        io.to(channelId).emit("lock_status_changed", { isLocked });
        console.log(`Admin ${user.name} changed lock status to: ${isLocked}`);
    });

    // تحديث قائمة المستخدمين (ترسل حالة الأدمن لكل التطبيقات)
    function emitUserList(channelId) {
        const list = Object.values(users)
            .filter(u => u.channel === channelId)
            .map(u => ({ name: u.name, isAdmin: u.isAdmin }));
        io.to(channelId).emit("channel_users_list", list);
    }

    socket.on("disconnect", () => {
        const user = users[socket.id];
        if (user) {
            delete users[socket.id];
            emitUserList(user.channel);
        }
    });
});