const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

app.use(express.json());

io.on('connection', (socket) => {
    console.log('مستخدم جديد اتصل - ID:', socket.id);

    // هذا السطر سيكشف لنا أي حدث يأتي من النسخة الجديدة
    socket.onAny((event, ...args) => {
        if (event !== 'join_channel' && event !== 'send_audio' && event !== 'voice_data') {
            console.log(`[DEBUG] حدث مجهول وصل من التطبيق: ${event}`);
        }
    });

    // دعم النسخ القديمة
    socket.on('send_audio', (data) => {
        const targetChannel = (typeof data === 'object') ? (data.channel || data.channelId || data.c) : null;
        if (targetChannel) {
            socket.to(targetChannel).emit('voice_data', data);
            console.log(`[LEGACY AUDIO] توزيع بيانات من send_audio لقناة: ${targetChannel}`);
        }
    });

    // دعم النسخ الجديدة
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
