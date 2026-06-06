const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

app.use(express.json());

io.on('connection', (socket) => {
    console.log('مستخدم متصل:', socket.id);

    // معالجة كافة أنواع الأحداث لضمان توافق النسخ القديمة
    socket.onAny((event, ...args) => {
        // إذا كان الحدث هو send_audio (الخاص بالنسخ القديمة) نعامله كأنه voice_data
        if (event === 'send_audio') {
            const data = args[0];
            const targetChannel = (typeof data === 'object') ? (data.channel || data.channelId || data.c) : null;
            
            if (targetChannel) {
                socket.to(targetChannel).emit('voice_data', data);
                console.log(`[LEGACY AUDIO] توزيع بيانات من ${event} لقناة: ${targetChannel}`);
            }
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
