const express = require('express');
const app = express();
app.use(express.json());

// مسار للتحقق من الاتصال (Render يحب هذا)
app.get('/', (req, res) => res.status(200).send('Server is alive'));

// مسار الطرد (صلاحية عبدالله)
app.post('/api/kick', (req, res) => {
    const { channel, usernameToKick, adminName } = req.body;
    if (adminName === "عبدالله") {
        console.log(`تم طرد ${usernameToKick} من قناة ${channel}`);
        res.status(200).json({ status: "success" });
    } else {
        res.status(403).json({ status: "error", message: "لا تملك الصلاحية" });
    }
});

// تشغيل السيرفر مع المنفذ الصحيح لـ Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`السيرفر يعمل الآن ومستقر على المنفذ ${PORT}`);
});