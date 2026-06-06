const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

app.use(express.json());

io.on('connection', (socket) => {
    console.log('مستخدم متصل:', socket.id);

    // استقبال أي حدث غير معروف (لحل مشكلة النسخ القديمة)
    socket.onAny((event, ...args) => {
        console.log(`[DEBUG] حدث مستلم: ${event}`);
        if (event !== 'join_channel' && event !== 'voice_data') {
            // محاولة معالجة أي حدث غريب كأنه بيانات صوت
            socket.broadcast.emit('voice_data', args[0]);
        }
    });

    socket.on('join_channel', (data) => {
        const channel = (typeof data === 'object') ? (data.channel || data.channelId || data.c) : data;
        if (channel) {
            socket.join(channel);
            console.log(`[JOIN] انضمام للقناة: ${channel}`);
        }
    });

    socket.on('voice_data', (data) => {
        const targetChannel = (typeof data === 'object') ? (data.channel || data.channelId || data.c) : null;
        if (targetChannel) {
            socket.to(targetChannel).emit('voice_data', data);
            console.log(`[AUDIO OK] توزيع لقناة: ${targetChannel}`);
        } else {
            socket.broadcast.emit('voice_data', data);
            console.log(`[AUDIO RAW] بث بيانات للجميع`);
        }
    });
});

app.get('/', (req, res) => {
    res.status(200).send('Server is active.');
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
