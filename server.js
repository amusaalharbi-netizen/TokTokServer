const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

app.use(express.json());

io.on('connection', (socket) => {
    console.log('مستخدم جديد اتصل - ID:', socket.id);

    // استقبال الانضمام للقنوات
    socket.on('join_channel', (data) => {
        const channel = data?.channel || data?.channelId;
        const username = data?.username || "Guest";
        
        if (channel) {
            socket.join(channel);
            console.log(`[INFO] انضم للقناة: ${channel} | المستخدم: ${username}`);
        }
    });

    // معالجة ونقل بيانات الصوت
    socket.on('voice_data', (data) => {
        // التحقق من وجود بيانات وقناة
        if (!data || !data.channel) return;

        // إرسال الصوت لكل الموجودين في نفس القناة (Broadcast)
        socket.to(data.channel).emit('voice_data', data);

        // سجل للتحقق أن السيرفر يوزع الصوت
        console.log(`[AUDIO] توزيع بيانات صوتية للقناة: ${data.channel} | الحجم: ${data.audioData ? 'موجود' : 'فارغ'}`);
    });
});

app.get('/', (req, res) => {
    res.status(200).send('Server is active and broadcasting.');
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
