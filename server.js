const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

io.on('connection', (socket) => {
    // استقبال الصوت وإعادة إرساله للجميع كما هو (نص خام)
    socket.on('send_audio', (data) => {
        // إذا كان التطبيق يرسل كائناً (JSON)، نأخذ البيانات فقط
        // إذا كان يرسل نصاً خاماً (Base64)، نأخذ النص مباشرة
        const audioContent = (typeof data === 'object' && data.data) ? data.data : data;

        // إرسال البيانات للجميع دون إضافة طوابع زمنية أو تعقيدات
        socket.broadcast.emit('send_audio', audioContent);
    });
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, '0.0.0.0');
