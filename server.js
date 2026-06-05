const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.json());

// مصفوفة بسيطة جداً لتخزين أسماء المستخدمين في كل قناة
let channelUsers = {}; 

// عند اتصال أي مستخدم
io.on('connection', (socket) => {
    
    // حدث دخول قناة
    socket.on('join_channel', (data) => {
        const { channel, username } = data;
        socket.join(channel);
        
        if (!channelUsers[channel]) channelUsers[channel] = [];
        if (!channelUsers[channel].includes(username)) {
            channelUsers[channel].push(username);
        }
        
        // إرسال قائمة المتواجدين المحدثة لكل من في القناة
        io.to(channel).emit('user_list_update', channelUsers[channel]);
    });

    // حدث الخروج
    socket.on('disconnect', () => {
        // يمكنك إضافة منطق حذف المستخدم هنا إذا أردت
    });
});

// مسار بسيط للتأكد أن السيرفر حي
app.get('/', (req, res) => {
    res.send('TokTok Audio Engine is running.');
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});