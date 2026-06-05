const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// إعداد مجلد الملفات (تأكد من وجود مجلد باسم uploads على السيرفر)
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// إعداد Multer للحفظ الآمن للملفات
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // حد أقصى 50 ميجا للملف لضمان استقرار السيرفر
});

app.use(express.json());

// مخزن مؤقت للرسائل (في التطبيق الفعلي يُفضل استخدام قاعدة بيانات مثل MongoDB)
let chatStore = [];

// 1. استقبال رسالة نصية مشفرة
app.post('/api/chat', (req, res) => {
    const { channel, encryptedMessage, sender } = req.body;
    chatStore.push({ channel, encryptedMessage, sender, type: 'text', timestamp: Date.now() });
    res.status(200).json({ success: true });
});

// 2. رفع ملف (صورة أو فيديو) مشفر
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send('لم يتم رفع أي ملف');
    
    // تسجيل رابط الملف كرسالة في القناة
    const { channel, sender } = req.body;
    chatStore.push({ 
        channel, 
        fileUrl: req.file.filename, 
        sender, 
        type: 'file', 
        timestamp: Date.now() 
    });
    
    res.status(200).json({ success: true, fileUrl: req.file.filename });
});

// 3. جلب الرسائل الخاصة بقناة معينة
app.get('/api/chat/:channel', (req, res) => {
    const messages = chatStore.filter(m => m.channel === req.params.channel);
    res.status(200).json(messages);
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`السيرفر يعمل ويدعم الدردشة والملفات على المنفذ ${PORT}`));