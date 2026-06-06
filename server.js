const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.json());

const MIN_ALLOWED_VERSION_CODE = 2; 
const CHANNEL_69_PASSWORD = "8966";

let authorizedUsers = {}; 

io.on('connection', (socket) => {

    socket.on('join_channel', (data) => {
        const { channel, username, password, appVersionCode } = data;

        // التحقق عند الانضمام
        if (channel === "69") {
            if (!appVersionCode || parseInt(appVersionCode) < MIN_ALLOWED_VERSION_CODE) {
                socket.emit('auth_error', "نسختك قديمة، يرجى التحديث.");
                return;
            }
            if (password !== CHANNEL_69_PASSWORD) {
                socket.emit('auth_error', "رمز الدخول غير صحيح!");
                return;
            }
            authorizedUsers[username] = true;
        }

        socket.join(channel);
    });

    // الحماية الصارمة: التحقق في كل حزمة صوتية
    socket.on('voice_data', (data) => {
        const { channel, username, appVersionCode } = data;
        
        if (channel === "69") {
            // التحقق مرة أخرى من النسخة ومن الصلاحية
            if (!appVersionCode || parseInt(appVersionCode) < MIN_ALLOWED_VERSION_CODE || !authorizedUsers[username]) {
                console.log(`[SECURITY] محاولة اختراق صوتي من نسخة قديمة: ${username}`);
                return; // السيرفر يرفض معالجة الصوت نهائياً
            }
        }
        
        socket.to(channel).emit('voice_data', data);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Secure Server running on port ${PORT}`);
});
