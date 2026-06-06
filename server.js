const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.json());

// الإعدادات
const MIN_ALLOWED_VERSION_CODE = 2;
const CHANNEL_69_PASSWORD = "8966";
let authorizedUsers = {};

io.on('connection', (socket) => {
    // 1. التحقق من الإصدار عند الاتصال (Handshake)
    const clientVersion = socket.handshake.query.appVersionCode;
    if (!clientVersion || parseInt(clientVersion) < MIN_ALLOWED_VERSION_CODE) {
        socket.disconnect(true);
        return;
    }

    // 2. الانضمام للقناة
    socket.on('join_channel', (data) => {
        if (!data || !data.channel || !data.username) return;

        if (data.channel === "69" && data.password !== CHANNEL_69_PASSWORD) {
            socket.emit('auth_error', "رمز الدخول غير صحيح!");
            return;
        }
        
        if (data.channel === "69") authorizedUsers[data.username] = true;
        
        socket.join(data.channel);
        console.log(`[INFO] انضم للقناة: ${data.channel} | المستخدم: ${data.username}`);
    });

    // 3. معالجة ونقل الصوت
    socket.on('voice_data', (data) => {
        if (!data || !data.channel || !data.username) return;
        
        // التحقق من صلاحية القناة 69
        if (data.channel === "69" && !authorizedUsers[data.username]) return;
        
        // إعادة توجيه الصوت للمشتركين في القناة
        socket.to(data.channel).emit('voice_data', data);
        
        // سجل للتحقق من مرور الصوت في الـ Logs
        console.log(`[AUDIO] تمرير صوت في قناة ${data.channel} من: ${data.username}`);
    });
});

// مسار للتأكد من حالة السيرفر
app.get('/', (req, res) => {
    res.status(200).send('TokTok Secure Server is Active.');
});

// تشغيل السيرفر على المنفذ المطلوب
const PORT = process.env.PORT || 10000;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Secure Server is running on port ${PORT}`);
});
