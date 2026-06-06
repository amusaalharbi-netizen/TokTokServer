const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.json());

io.on('connection', (socket) => {
    console.log('مستخدم جديد اتصل بالسيرفر');

    socket.on('join_channel', (data) => {
        // نستخدم || "" لتجنب الـ undefined
        const channel = data?.channel || data?.channelId || "unknown";
        const username = data?.username || "Guest";
        
        socket.join(channel);
        console.log(`[INFO] انضم للقناة: ${channel} | المستخدم: ${username}`);
    });

    socket.on('voice_data', (data) => {
        if (!data || !data.channel) return;
        
        // إعادة التوجيه لكل من في القناة
        socket.to(data.channel).emit('voice_data', data);
        
        // سجل للـ Debug في لوحة تحكم Render
        console.log(`[AUDIO] تمرير صوت في قناة: ${data.channel}`);
    });
});

app.get('/', (req, res) => {
    res.status(200).send('TokTok Server is running.');
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
