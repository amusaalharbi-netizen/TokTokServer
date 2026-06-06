const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

app.use(express.json());

io.on('connection', (socket) => {
    console.log('مستخدم جديد اتصل:', socket.id);

    // استقبال القنوات
    socket.on('join_channel', (data) => {
        const channel = (typeof data === 'object') ? (data.channel || data.channelId || data.c) : data;
        if (channel) {
            socket.join(channel);
            console.log(`[JOIN] انضمام للقناة: ${channel}`);
        }
    });

    // معالجة موحدة لكل أنواع إشارات الصوت
    const handleVoice = (data) => {
        // استخراج القناة بأي شكل كانت
        const targetChannel = (typeof data === 'object') ? (data.channel || data.channelId || data.c) : null;
        
        if (targetChannel) {
            // نقوم بإعادة بناء كائن البيانات ليكون موحداً للجميع
            const normalizedData = {
                channel: targetChannel,
                audioData: data.audioData || data.data || data, // نأخذ الصوت من أي حقل كان
                timestamp: Date.now()
            };
            
            // إرسال البيانات الموحدة
            socket.to(targetChannel).emit('voice_data', normalizedData);
            console.log(`[AUDIO SYNC] توزيع بيانات موحدة للقناة: ${targetChannel}`);
        }
    };

    socket.on('send_audio', handleVoice); // للنسخ القديمة
    socket.on('voice_data', handleVoice); // للنسخ الجديدة
    socket.on('ptt_start', () => console.log("[DEBUG] ptt_start received"));
    socket.on('ptt_stop', () => console.log("[DEBUG] ptt_stop received"));
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
