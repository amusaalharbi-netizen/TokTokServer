const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.json());

const MIN_ALLOWED_VERSION_CODE = 2;
const CHANNEL_69_PASSWORD = "8966";
let authorizedUsers = {};

io.on('connection', (socket) => {
    // الحصول على رقم النسخة من الاتصال
    const clientVersion = socket.handshake.query.appVersionCode;

    // الحماية الصارمة عند الاتصال
    if (!clientVersion || parseInt(clientVersion) < MIN_ALLOWED_VERSION_CODE) {
        socket.disconnect(true);
        return;
    }

    socket.on('join_channel', (data) => {
        if (data.channel === "69" && data.password !== CHANNEL_69_PASSWORD) {
            socket.emit('auth_error', "رمز الدخول غير صحيح!");
            return;
        }
        if (data.channel === "69") authorizedUsers[data.username] = true;
        socket.join(data.channel);
    });

    socket.on('voice_data', (data) => {
        if (data.channel === "69" && !authorizedUsers[data.username]) return;
        socket.to(data.channel).emit('voice_data', data);
    });
});

app.get('/', (req, res) => {
    res.status(200).send('TokTok Secure Server is Active.');
});

// المنفذ الديناميكي (الأهم)
const PORT = process.env.PORT || 10000;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
