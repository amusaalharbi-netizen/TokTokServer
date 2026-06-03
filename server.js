const io = require("socket.io")(process.env.PORT || 3000);

io.on("connection", (socket) => {
    
    // إضافة منطق الانضمام والخروج من القنوات هنا
    socket.on("join_channel", (channelId) => {
        socket.join(channelId);
        console.log(`User joined channel: ${channelId}`);
    });

    socket.on("leave_channel", (channelId) => {
        socket.leave(channelId);
        console.log(`User left channel: ${channelId}`);
    });

    // معالجة الصوت
    socket.on("send_audio", (data) => {
        const audioBuffer = Buffer.from(data.audio, 'base64');
        socket.to(data.channelId).emit("audio_data", audioBuffer);
        console.log(`Broadcasting ${audioBuffer.length} bytes to channel ${data.channelId}`);
    });
});