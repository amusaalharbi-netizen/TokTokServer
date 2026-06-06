const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

app.use(express.json());

io.on('connection', (socket) => {
    console.log('مستخدم متصل:', socket.id);

    socket.on('join_channel', (data) => {
        const channel = (typeof data === 'object') ? (data.channel || data.channelId || data.c) : data;
        if (channel) {
            socket.join(channel);
            console.log(`[JOIN] انضمام للقناة: ${channel}`);
        }
    });

    // معالجة الصوت الموحدة
    const handleVoice = (data) => {
        const channel = (typeof data === 'object') ? (data.channel || data.channelId || data.c) : null;
        
        if (channel) {
            // نقوم بدمج البيانات في كائن واحد شامل يفهمه التطبيق القديم والجديد
            const unifiedPacket = {
                channel: channel,
                channelId: channel,
                c: channel,
                audioData: data.audioData || data.data || data,
                data: data.audioData || data.data || data,
                timestamp: Date.now()
            };

            // بث البيانات لكل المشتركين في نفس القناة
            socket.to(channel).emit('voice_data', unifiedPacket);
            socket.to(channel).emit('send_audio', unifiedPacket);
            
            console.log(`[AUDIO SYNC] توزيع بيانات موحدة للقناة: ${channel}`);
        }
    };

    socket.on('send_audio', handleVoice);
    socket.on('voice_data', handleVoice);
});

app.get('/', (req, res) => {
    res.status(200).send('Server is active.');
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
