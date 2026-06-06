const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.json());

// مصفوفة لتخزين المستخدمين المصرح لهم (Tokenization)
let authorizedUsers = {}; 

io.on('connection', (socket) => {

    // حدث انضمام للقناة مع تحقق أمني
    socket.on('join_channel', (data) => {
        const { channel, username, password } = data;

        // طبقة حماية للقناة 69
        if (channel === "69") {
            if (password !== "8966") {
                socket.emit('auth_error', "رمز الدخول للقناة 69 غير صحيح!");
                return; // إيقاف الانضمام فوراً
            }
            authorizedUsers[username] = true; // تسجيله كمستخدم مصرح له
        }

        socket.join(channel);
        socket.emit('auth_success', "تم الدخول بنجاح");
    });

    // مراقبة الرسائل الصوتية (الحماية الثانية)
    socket.on('voice_data', (data) => {
        const { channel, username } = data;
        
        // إذا كان يحاول إرسال صوت للقناة 69 وهو غير مصرح له
        if (channel === "69" && !authorizedUsers[username]) {
            console.log(`[SECURITY ALERT] محاولة اختراق صوتي من ${username}`);
            return; // تجاهل حزمة الصوت تماماً
        }
        
        // إذا كان مصرحاً له، مرر الصوت لبقية المستخدمين
        socket.to(channel).emit('voice_data', data);
    });
});

app.get('/', (req, res) => {
    res.status(200).send('TokTok Secure Server is Active.');
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Secure Server running on port ${PORT}`);
});