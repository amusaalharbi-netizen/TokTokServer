const express = require('express');
const app = express();

app.use(express.json());

// مخزن مؤقت للقنوات المحمية (يمكنك توسيعه لاحقاً)
const protectedChannels = {
    "69": "8966" // رقم القناة: الرمز السري
};

// مسار التحقق من الرمز (يطلبه التطبيق قبل فتح القناة)
app.post('/api/verify-channel', (req, res) => {
    const { channel, password } = req.body;

    if (protectedChannels[channel]) {
        if (protectedChannels[channel] === password) {
            res.status(200).json({ success: true, message: "تم التحقق، يمكنك الدخول" });
        } else {
            res.status(401).json({ success: false, message: "رمز خاطئ" });
        }
    } else {
        // إذا لم تكن القناة محمية، اسمح بالدخول مباشرة
        res.status(200).json({ success: true });
    }
});

// المسار الرئيسي للبيانات
app.get('/api/data', (req, res) => {
    res.status(200).json({ success: true, data: "النظام يعمل" });
});

// مسار الطرد (صلاحية عبدالله فقط)
app.post('/api/kick', (req, res) => {
    const { channel, usernameToKick, adminName } = req.body;
    if (adminName === "عبدالله") {
        console.log(`طرد ${usernameToKick} من قناة ${channel}`);
        res.status(200).send({ status: "success" });
    } else {
        res.status(403).send({ status: "error", message: "لا تملك الصلاحية" });
    }
});

// معالجة الأخطاء
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'حدث خطأ في السيرفر' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`السيرفر يعمل الآن على المنفذ ${PORT} مع تفعيل حماية القنوات.`);
});