const io = require("socket.io")(process.env.PORT || 3000);

console.log("Server is running on port 3000...");

io.on("connection", (socket) => {
    console.log(`New connection: ${socket.id}`);

    // الانضمام لقناة (يستقبل رقم القناة كـ string)
    socket.on("join_channel", (channelId) => {
        socket.join(channelId);
        console.log(`User joined channel: ${channelId}`);
        // طباعة الغرف الحالية للمستخدم للتأكد
        console.log(`User rooms now: ${JSON.stringify([...socket.rooms])}`);
    });

    // مغادرة قناة
    socket.on("leave_channel", (channelId) => {
        socket.leave(channelId);
        console.log(`User left channel: ${channelId}`);
    });

    // استقبال الصوت من التطبيق وإعادة بثه للقناة المحددة
    socket.on("send_audio", (data) => {
        // data المتوقع وصولها من التطبيق: { channelId: "رقم القناة", audio: "base64_string" }
        
        if (data && data.channelId && data.audio) {
            // بث الصوت لبقية المشتركين في نفس القناة
            socket.to(data.channelId).emit("audio_data", {
                channelId: data.channelId,
                audio: data.audio 
            });
            
            console.log(`Broadcasting ${data.audio.length} bytes to channel ${data.channelId}`);
        } else {
            console.log("Received invalid audio data format.");
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});