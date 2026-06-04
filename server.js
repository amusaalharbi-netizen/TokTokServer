const express = require('express');
const app = express();

// إعداد السيرفر لاستقبال بيانات JSON
app.use(express.json());

// مسار افتراضي للتأكد من أن السيرفر يعمل
app.get('/', (req, res) => {
    res.status(200).send({
        message: "تم إزالة نظام القفل نهائياً. النظام مفتوح للجميع."
    });
});

// المسار الذي كان يحتوي على منطق التحقق، تم تنظيفه ليصبح عاماً
app.get('/api/data', (req, res) => {
    // تم حذف أي شروط تحقق (If/Else) كانت تعتمد على الأسماء
    res.status(200).json({
        success: true,
        message: "تم الوصول للبيانات بنجاح",
        data: "محتوى التطبيق متاح للجميع الآن"
    });
});

// معالجة أي أخطاء برمجية قد تحدث
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'حدث خطأ في السيرفر' });
});

// تشغيل السيرفر على المنفذ الافتراضي
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`السيرفر يعمل الآن على المنفذ ${PORT} بدون أي قيود أو أقفال.`);
});