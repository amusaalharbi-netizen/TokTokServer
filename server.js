const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

app.use(express.json());

io.on('connection', (socket) => {
    console.log('مستخدم متصل:', socket.id);

    socket.on('join_channel', (data) => {
        // يدعم التنسيق الجديد والقديم
        const channel = data?.channel || data?.channelId || data; 
        socket.join(channel);
        console.log(`[LEGACY] انضمام للقناة: ${channel}`);
    });

    socket.on('voice_data', (data) => {
        // منطق التوافق: إذا لم نجد قناة، نفترض أن البيانات هي القناة أو نبحث عنها في أماكن أخرى
        let targetChannel = data?.channel || data?.channelId || data?.c;

        if (targetChannel) {
            socket.to(targetChannel).emit('voice_data', data);
            console.log(`[AUDIO] توزيع بيانات لقناة: ${targetChannel}`);
        } else {
            // محاولة أخيرة: إذا كانت البيانات نفسها عبارة عن صوت فقط بدون "غلاف" JSON
            console.log("استقبال بيانات صوتية خام (Raw)...");
            socket.broadcast.emit('voice_data', data); 
        }
    });
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
