const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

app.use(express.json());

io.on('connection', (socket) => {
    // نستخدم الـ handshake لنعرف هل هذا التطبيق قديم أم جديد
    const isLegacy = socket.handshake.query.version === 'old'; 
    socket.isLegacy = isLegacy;

    socket.on('join_channel', (data) => {
        const channel = (typeof data === 'object') ? (data.channel || data.channelId || data.c) : data;
        if (channel) socket.join(channel);
    });

    const handleVoice = (data) => {
        const channel = (typeof data === 'object') ? (data.channel || data.channelId || data.c) : null;
        if (!channel) return;

        // إرسال البيانات لكل من في القناة بناءً على إصدارهم
        io.sockets.adapter.rooms.get(channel)?.forEach(socketId => {
            const targetSocket = io.sockets.sockets.get(socketId);
            
            if (targetSocket.isLegacy) {
                // للنسخة القديمة: نرسل فقط البيانات الخام (Raw) التي يتوقعها التطبيق
                targetSocket.emit('send_audio', data.audioData || data);
            } else {
                // للنسخة الجديدة: نرسل البيانات الموحدة الكاملة
                targetSocket.emit('voice_data', { channel, audioData: data.audioData || data });
            }
        });
    };

    socket.on('send_audio', handleVoice);
    socket.on('voice_data', handleVoice);
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, '0.0.0.0');
