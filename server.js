const io = require("socket.io")(process.env.PORT || 3000);

console.log("Server is running on port 3000...");

io.on("connection", (socket) => {
    console.log(`New user connected: ${socket.id}`);

    // الانضمام لقناة (القناة تأتي كرقم من التطبيق)
    socket.on("join_channel", (channelId) => {
        if (channelId && channelId.trim() !== "") {
            socket.join(channelId);
            console.log(`User ${socket.id} joined channel: ${channelId}`);
        }
    });

    // مغادرة قناة
    socket.on("leave_channel", (channelId) => {
        if (channelId) {
            socket.leave(channelId);
            console.log(`User ${socket.id} left channel: ${channelId}`);
        }
    });

    // استقبال الصوت من التطبيق وإعادة بثه للقناة المحددة
    socket.on("send_audio", (data) => {
        // التحقق من وصول البيانات بشكل صحيح
        if (data && data.channelId && data.audio) {
            // إرسال البيانات لكل المشتركين في القناة المعنية
            // ملاحظة: التطبيق الآن يتوقع استقبال كائن JSON يحتوي على channelId و audio
            socket.to(data.channelId).emit("audio_data", {
                channelId: data.channelId,
                audio: data.audio
            });
            
            console.log(`Broadcasting audio to channel: ${data.channelId} | Size: ${data.audio.length} bytes`);
        } else {
            console.log("Received invalid audio packet.");
        }
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});