const io = require("socket.io")(process.env.PORT || 3000);

io.on("connection", (socket) => {
    // الانضمام لقناة
    socket.on("join_channel", (channelId) => {
        socket.join(channelId);
        console.log(`User joined channel: ${channelId}`);
    });

    // مغادرة قناة
    socket.on("leave_channel", (channelId) => {
        socket.leave(channelId);
        console.log(`User left channel: ${channelId}`);
    });

    // استقبال وبث الصوت
    socket.on("send_audio", (data) => {
        // نرسل البيانات ككائن ليعرف التطبيق القناة التي أرسلت الصوت
        socket.to(data.channelId).emit("audio_data", {
            channelId: data.channelId,
            audio: data.audio
        });
        console.log(`Broadcasting audio to channel ${data.channelId}`);
    });
});