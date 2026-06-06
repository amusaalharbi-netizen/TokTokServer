const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.json());

// المتغيرات الثابتة للحماية
const MIN_ALLOWED_VERSION_CODE = 2; // لن يقبل السيرفر أي نسخة أقل من 2
const CHANNEL_69_PASSWORD = "8966";

// مصفوفة لتخزين المستخدمين المصرح لهم
let authorizedUsers = {}; 

io.on('connection', (socket) => {

    socket.on('join_channel', (data) => {
        const { channel, username, password, appVersionCode } = data;

        // حماية أمنية: منع النسخ القديمة من دخول القناة 69
        if (channel === "69") {
            if (!appVersionCode || parseInt(appVersionCode) < MIN_ALLOWED_VERSION_CODE) {
                socket.emit('auth_error', "نسخة تطبيقك قديمة، يرجى التحديث للدخول لهذه القناة.");
                console.log(`[BLOCK] نسخة قديمة حاولت دخول القناة 69: ${username}`);
                return;
            }

            // التحقق من رمز الدخول للقناة 69
            if (password !== CHANNEL_69_PASSWORD) {
                socket.emit('auth_error', "رمز الدخول غير صحيح!");
                return;
            }
            
            authorizedUsers[username] = true;
        }

        socket.join(channel);
        socket.emit('auth_success', "تم الدخول بنجاح");
        console.log(`[INFO] المستخدم ${username} انضم للقناة ${channel}`);
    });

    // حماية الصوت: لا يسمح بإرسال صوت للقناة 69 إلا للمصرح لهم
    socket.on('voice_data', (data) => {
        const { channel, username } = data;
        
        if (channel === "69" && !authorizedUsers[username]) {
            return; // تجاهل حزمة الصوت
        }
        
        socket.to(channel).emit('voice_data', data);
    });
});

app.get('/', (req, res) => {
    res.status(200).send('TokTok Secure Server Active');
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Secure Server running on port ${PORT}`);
});
