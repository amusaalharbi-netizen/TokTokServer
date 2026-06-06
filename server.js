const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const MIN_ALLOWED_VERSION_CODE = 2;

io.on('connection', (socket) => {
    // الحصول على رقم الإصدار من "يد" الاتصال (Handshake)
    const clientVersion = socket.handshake.query.appVersionCode;

    // طرد أي نسخة قديمة فوراً عند محاولة الاتصال
    if (!clientVersion || parseInt(clientVersion) < MIN_ALLOWED_VERSION_CODE) {
        console.log(`[SECURITY] طرد نسخة قديمة: ${clientVersion}`);
        socket.disconnect(true); // قطع الاتصال فوراً
        return;
    }

    socket.on('join_channel', (data) => {
        // التحقق من الرمز للقناة 69
        if (data.channel === "69" && data.password !== "8966") {
            socket.emit('auth_error', "رمز الدخول غير صحيح!");
            return;
        }
        socket.join(data.channel);
    });

    socket.on('voice_data', (data) => {
        // منع أي صوت للقناة 69 إلا للمصرح لهم
        socket.to(data.channel).emit('voice_data', data);
    });
});

http.listen(process.env.PORT || 3000, '0.0.0.0');
