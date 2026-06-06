const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

app.use(express.json());

io.on('connection', (socket) => {
    console.log('مستخدم متصل:', socket.id);

    // الانضمام للقنوات
    socket.on('join_channel', (data) => {
        const channel = (typeof data === 'object') ? (data.channel || data.channelId || data.c) : data;
        if (channel) {
            socket.join(channel);
            console.log(`[JOIN] انضمام للقناة: ${channel}`);
        }
    });

    // معالجة الصوت الموحدة
    const handleVoice = (data) => {
        const channel = (typeof data === 'object') ? (data.channel || data.channelId || data.c) : null;
        if (!channel) return;

        // 1. استخراج محتوى الصوت (Base64) من أي حقل كان
        const audioContent = data.audioData || data.data || data;

        // 2. تجهيز حزمة متوافقة جداً (بسيطة ومباشرة)
        const outputPacket = {
            channel: channel,
            data: audioContent // المفتاح "data" هو ما تبحث عنه النسخ القديمة
        };

        // 3. البث لجميع المشتركين في الغرفة باستثناء المرسل (لإلغاء الصدى)
        // نرسل بالحدثين لضمان التقاط التطبيقات للبيانات
        socket.broadcast.to(channel).emit('send_audio', outputPacket);
        socket.broadcast.to(channel).emit('voice_data', outputPacket);
        
        console.log(`[RELAY] توزيع صوت للقناة: ${channel}`);
    };

    // الاستماع للحدثين من النسختين
    socket.on('send_audio', handleVoice);
    socket.on('voice_data', handleVoice);
});

// تفعيل السيرفر
const PORT = process.env.PORT || 10000;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
