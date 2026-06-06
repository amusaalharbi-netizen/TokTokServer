const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

io.on('connection', (socket) => {
    socket.on('send_audio', (data) => {
        // إذا كان السيرفر يستلم بيانات متسارعة جداً، فهذا يسبب التشويش
        // هنا نضيف تأخيراً بسيطاً (Throttling) لضمان خروج الحزم بنظام
        const audioContent = (typeof data === 'object' && data.data) ? data.data : data;

        const packet = {
            data: audioContent,
            timestamp: Date.now() // إضافة طابع زمني يساعد التطبيق في ترتيب الصوت
        };

        // بدلاً من البث المباشر الفوري، نستخدم setTimeout بسيط لتوزيع الحمل
        // هذا يمنع الـ Underrun في الأجهزة القديمة
        setTimeout(() => {
            socket.broadcast.emit('send_audio', packet);
        }, 5); // تأخير 5 مللي ثانية فقط لترتيب تدفق الحزم
    });
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, '0.0.0.0');
