const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

app.use(express.json());

io.on('connection', (socket) => {
    console.log('مستخدم جديد اتصل - ID:', socket.id);

    // استقبال أي حدث للتأكد من رؤية تحركات التطبيق الجديد
    socket.onAny((event, ...args) => {
        if (event !== 'join_channel' && event !== 'send_audio' && event !== 'voice_data') {
            console.log(`[DEBUG] حدث مجهول وصل من التطبيق: ${event}`);
        }
    });

    // معالجة القنوات (توحيد المسار)
    socket.on('join_channel', (data) => {
        const channel = (typeof data === 'object') ? (data.channel || data.channelId || data.c) : data;
        if (channel) {
            socket.join(channel);
            console.log(`[JOIN] انضمام للقناة: ${channel}`);
        }
    });

    // توحيد استقبال الصوت من القديم (send_audio) والجديد (voice_data)
    const handleVoice = (data) => {
        const targetChannel = (typeof data === 'object') ? (data.channel || data.channelId || data.c) : null;
        if (targetChannel) {
            // هنا السيرفر يعيد بث الصوت دائماً بصيغة voice_data ليفهمها الجميع
            socket.to(targetChannel).emit('voice_data', data);
            console.log(`[AUDIO SYNC] إعادة بث للصوت في القناة: ${targetChannel}`);
        }
    };

    socket.on('send_audio', handleVoice);
    socket.on('voice_data', handleVoice);
});

app.get('/', (req, res) => {
    res.status(200).send('Server is active.');
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
