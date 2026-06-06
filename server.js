const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.json());

// الإعدادات الثابتة
const MIN_ALLOWED_VERSION_CODE = 2;
const CHANNEL_69_PASSWORD = "8966";
let authorizedUsers = {};

// إعدادات الـ Socket
io.on('connection', (socket) => {
    // التحقق من رقم النسخة عند بدء الاتصال (Handshake)
    const clientVersion = socket.handshake.query.appVersionCode;

    // طرد أي نسخة قديمة فوراً
    if (!clientVersion || parseInt(clientVersion) < MIN_ALLOWED_VERSION_CODE) {
        console.log(`[SECURITY] طرد نسخة قديمة حاولت الاتصال: ${clientVersion}`);
        socket.disconnect(true);
        return;
    }

    socket.on('join_channel', (data) => {
        // التحقق من كلمة مرور القناة 69
        if (data.channel === "69" && data.password !== CHANNEL_69_PASSWORD) {
            socket.emit('auth_error', "رمز الدخول غير صحيح!");
            return;
        }
        
        if (data.channel === "69") {
            authorizedUsers[data.username] = true;
        }
        
        socket.join(data.channel);
        console.log(`[INFO] المستخدم ${data.username} انضم للقناة ${data.channel}`);
    });

    socket.on('voice_data', (data) => {
        // التحقق من الصلاحية قبل تمرير الصوت
        if (data.channel === "69" && !authorizedUsers[data.username]) {
            return;
        }
        
        socket.to(data.channel).emit('voice_data', data);
    });
});

// المسار الرئيسي للتأكد من عمل السيرفر
app.get('/', (req, res) => {
    res.status(200).send('TokTok Secure Server is Active.');
});

// تشغيل السيرفر على المنفذ المخصص (PORT) أو 10000 كاحتياط
const PORT = process.env.PORT || 10000;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Secure Server is running on port ${PORT}`);
});
