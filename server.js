const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

app.use(express.json());

io.on('connection', (socket) => {
    socket.on('join_channel', (data) => {
        const channel = (typeof data === 'object') ? (data.channel || data.channelId || data.c) : data;
        if (channel) socket.join(channel);
    });

    const broadcastUnified = (data, eventName) => {
        const channel = (typeof data === 'object') ? (data.channel || data.channelId || data.c) : null;
        if (channel) {
            // توحيد البيانات قبل إعادة البث
            const cleanData = {
                channel: channel,
                audioData: data.audioData || data.data || data,
                isLegacy: eventName === 'send_audio'
            };
            // إرسال للكل بنفس الصيغة
            socket.to(channel).emit('voice_data', cleanData);
            socket.to(channel).emit('send_audio', cleanData);
        }
    };

    socket.on('send_audio', (d) => broadcastUnified(d, 'send_audio'));
    socket.on('voice_data', (d) => broadcastUnified(d, 'voice_data'));
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, '0.0.0.0');
