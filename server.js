const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

app.use(express.json());

io.on('connection', (socket) => {
    console.log('مستخدم متصل:', socket.id);

    // التعامل مع انضمام القنوات (دعم التنسيق القديم والجديد)
    socket.on('join_channel', (data) => {
        const channel = (typeof data === 'object') ? (data.channel || data.channelId || data.c) : data;
        if (channel) {
            socket.join(channel);
            console.log(`[JOIN] انضمام للقناة: ${channel}`);
        }
    });

    // التعامل مع بيانات الصوت (دعم التنسيق القديم والجديد)
    socket.on('voice_data', (data) => {
        // محاولة استخراج القناة من أي مكان ممكن
        const targetChannel = (typeof data === 'object') ? (data.channel || data.channelId || data.c) : null;
        
        if (targetChannel) {
            // توزيع البيانات لمن هم في نفس القناة
            socket.to(targetChannel).emit('voice_data', data);
            console.log(`[AUDIO OK] توزيع بيانات لقناة: ${targetChannel} | الحجم: ${JSON.stringify(data).length} bytes`);
        } else {
            // في حال كانت البيانات "خام" بدون غلاف القناة
            socket.broadcast.emit('voice_data', data);
            console.log(`[AUDIO RAW] بث بيانات خام للجميع`);
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
