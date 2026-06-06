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

    const relayAudio = (data, sourceEvent) => {
        const channel = (typeof data === 'object') ? (data.channel || data.channelId || data.c) : null;
        if (!channel) return;

        // استخراج محتوى الصوت بغض النظر عن اسمه
        const audioContent = data.audioData || data.data || data;

        // تجهيز الصيغة للقديم (يريد send_audio)
        const legacyPacket = { channel: channel, data: audioContent };
        
        // تجهيز الصيغة للجديد (يريد voice_data)
        const newPacket = { channel: channel, audioData: audioContent };

        // البث لجميع المستخدمين في القناة باستثناء المرسل
        // نرسل بالصيغتين ليضمن كل تطبيق وصول ما يفهمه
        socket.broadcast.to(channel).emit('send_audio', legacyPacket);
        socket.broadcast.to(channel).emit('voice_data', newPacket);
        
        console.log(`[RELAY] توزيع الصوت في قناة: ${channel} من ${sourceEvent}`);
    };

    socket.on('send_audio', (d) => relayAudio(d, 'send_audio'));
    socket.on('voice_data', (d) => relayAudio(d, 'voice_data'));
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, '0.0.0.0');
