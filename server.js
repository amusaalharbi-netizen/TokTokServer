const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

app.use(express.json());

io.on('connection', (socket) => {
    console.log('مستخدم متصل:', socket.id);

    socket.on('join_channel', (data) => {
        const channel = (typeof data === 'object') ? (data.channel || data.channelId || data.c) : data;
        if (channel) socket.join(channel);
    });

    const handleVoice = (data) => {
        const channel = (typeof data === 'object') ? (data.channel || data.channelId || data.c) : null;
        if (!channel) return;

        // التعديل هنا: استخدام broadcast يمنع إرسال الصوت لصاحب الجهاز الذي يتحدث
        // وبهذا تختفي مشكلة الصدى فوراً
        socket.broadcast.to(channel).emit('voice_data', data);
        socket.broadcast.to(channel).emit('send_audio', data);
        
        console.log(`[AUDIO NO-ECHO] تم بث الصوت في قناة: ${channel} (بدون صدى)`);
    };

    socket.on('send_audio', handleVoice);
    socket.on('voice_data', handleVoice);
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, '0.0.0.0');
