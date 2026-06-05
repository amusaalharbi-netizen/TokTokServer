const express = require('express');
const app = express();

app.use(express.json());

// مسار ترحيبي للتأكد من أن السيرفر يعمل
app.get('/', (req, res) => {
    res.status(200).send('TokTok Server is running perfectly.');
});

// مسار الطرد (Admin فقط: عبدالله أو عبدالعزيز)
app.post('/api/kick', (req, res) => {
    const { channel, usernameToKick, adminName } = req.body;

    // التحقق من صلاحيات عبدالله أو عبدالعزيز
    if (adminName === "عبدالله" || adminName === "عبدالعزيز") {
        console.log(`[ACTION] تم طرد ${usernameToKick} من قناة ${channel} بواسطة ${adminName}`);
        
        // هنا يمكنك إضافة منطق إرسال أمر الطرد لبقية المستخدمين إذا لزم الأمر
        res.status(200).json({ status: "success", message: "تم الطرد بنجاح" });
    } else {
        console.log(`[SECURITY] محاولة طرد غير مصرح بها بواسطة: ${adminName}`);
        res.status(403).json({ status: "error", message: "لا تملك الصلاحية للطرد" });
    }
});

// مسار التحقق من القنوات المحمية (مثل القناة 69)
app.post('/api/verify-channel', (req, res) => {
    const { channel, password } = req.body;

    if (channel === "69") {
        if (password === "8966") {
            res.status(200).json({ success: true, message: "تم التحقق، يمكنك الدخول" });
        } else {
            res.status(401).json({ success: false, message: "رمز خاطئ" });
        }
    } else {
        res.status(200).json({ success: true });
    }
});

// تشغيل السيرفر على المنفذ المطلوب وربطه بـ 0.0.0.0 ليقبل الاتصالات الخارجية
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is live on port ${PORT}`);
});
