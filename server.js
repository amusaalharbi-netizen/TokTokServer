const express = require('express');
const app = express();

app.use(express.json());

// مسار افتراضي
app.get('/', (req, res) => {
    res.status(200).send({ message: "النظام يعمل." });
});

// مسار استقبال بيانات المستخدمين
app.get('/api/data', (req, res) => {
    res.status(200).json({ success: true, message: "متاح" });
});

// المسار الجديد لتنفيذ الطرد (هذا هو المطلوب)
app.post('/api/kick', (req, res) => {
    const { channel, usernameToKick, adminName } = req.body;

    // التحقق من أن الشخص الذي يطلب الطرد هو عبدالله
    if (adminName === "عبدالله") {
        console.log(`تم تنفيذ أمر طرد للمستخدم: ${usernameToKick} من القناة: ${channel}`);
        
        // هنا يقوم السيرفر بمعالجة الطرد (حذف المستخدم من قائمة القناة)
        // أرسل تأكيد للتطبيق أن العملية تمت
        res.status(200).send({ status: "success", message: "تم طرد المستخدم بنجاح" });
    } else {
        res.status(403).send({ status: "error", message: "ليس لديك صلاحية" });
    }
});

// معالجة الأخطاء
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'حدث خطأ' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`السيرفر يعمل على المنفذ ${PORT}`);
});