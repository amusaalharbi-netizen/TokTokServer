const io = require("socket.io")(process.env.PORT || 3000);

io.on("connection", (socket) => {
    socket.on("join_channel", (channelId) => {
        socket.join(channelId);
    });

    socket.on("send_audio", (data) => {
        // فك تشفير الـ Base64 إلى Buffer ليتمكن التطبيق من تشغيله
        const audioBuffer = Buffer.from(data.audio, 'base64');
        
        // إرسال البيانات للمشتركين الآخرين
        // ملاحظة: غيرنا اسم الحدث إلى "audio_data" ليتطابق مع ما ينتظره التطبيق في كود الـ Service
        socket.to(data.channelId).emit("audio_data", audioBuffer);
        
        console.log(`Broadcasting ${audioBuffer.length} bytes to channel ${data.channelId}`);
    });
});