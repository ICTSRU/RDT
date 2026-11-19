# التوأم الرقمي للقاعات الدراسية — Rooms Digital Twin · v2.2
جامعة سليمان الراجحي — الإدارة التنفيذية للاتصالات وتقنية المعلومات (ICTD) · مركز عمليات تقنية المعلومات (ITOC)

منصة لإدخال واستعراض بيانات القاعات (الأجهزة، المواصفات، الصور الحقيقية) وتصنيفها إلى:
**قاعات المحاضرات · قاعات الاختبار · القاعات الدراسية · الفصول الدراسية** (إضافة إلى بند «أخرى» للاجتماعات/المقابلات).

- **الواجهة الأمامية (Front-end):** صفحات ثابتة على GitHub Pages.
- **الخادم (Back-end):** Google Sheet عبر Google Apps Script Web App.
- **الدخول:** حسابات Google الجامعية `@sr.edu.sa` فقط، مع شاشة ITOC وتسجيل كل دخول.

> **ترقيم الإصدار:** الإصدار معروض داخل الصفحة (شارة التذييل) ومضمَّن في اسم المجلد `rooms-digital-twin-v1.0`.
> أسماء الملفات بلا رقم إصدار؛ الترقيم برقم عشري واحد (… 1.9 → 2.0).

---

## 1) بنية المجلد
```
rooms-digital-twin-v1.0/
├── index.html              الواجهة (شاشة ITOC + تطبيق التوأم الرقمي)
├── config.js               الإعدادات الفعلية (API_URL + GOOGLE_CLIENT_ID)
├── config.sample.js        نموذج الإعدادات
├── assets/
│   ├── sru-tech-bg.css     نمط خلفية الشبكة المعتمد
│   ├── app.css             تنسيقات التطبيق
│   └── app.js              منطق التطبيق
├── apps-script/
│   ├── Code.gs             الخادم: القاعات، الصور، التحقق، سجل الدخول
│   └── appsscript.json     إعدادات نشر الـ Web App
├── data/
│   ├── rooms-seed.csv      ١٢٤ قاعة حقيقية (للاستيراد إلى Google Sheet)
│   └── rooms-seed.json     نفس البيانات (لوضع العرض بدون خادم)
├── .github/workflows/
│   └── deploy.yml          نشر Apps Script تلقائياً من GitHub (clasp)
├── CHANGELOG.md
└── README.md
```

## 2) إعداد الخادم (Google Sheet + Apps Script)
1. أنشئ Google Sheet جديداً (مثلاً باسم **Rooms Digital Twin**) وانسخ معرّفه (ID من الرابط).
2. من الـ Sheet: **Extensions → Apps Script**، ثم ألصق محتوى `apps-script/Code.gs`.
3. في أعلى `Code.gs` اضبط:
   - `SHEET_ID` (أو اتركه فارغاً إذا كان السكربت مربوطاً بنفس الـ Sheet).
   - `PHOTO_FOLDER_ID` = معرّف مجلد Drive لحفظ صور القاعات.
   - `GOOGLE_CLIENT_ID` = نفس معرّف عميل OAuth المستخدَم في الواجهة.
   - `ADMIN_EMAILS` = بريد المشرفين المخوّلين بالإضافة/التعديل.
4. **استيراد البيانات:** استورد `data/rooms-seed.csv` إلى تبويب باسم `Rooms`
   (أو انسخ مصفوفة `rooms-seed.json` داخل الدالة `seedRooms()` وشغّلها مرة واحدة).
5. **النشر:** **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - انسخ رابط `/exec` الناتج.

يُنشئ السكربت تلقائياً تبويبي `Rooms` و `AccessLog` إذا لم يوجدا.

## 3) إعداد تسجيل الدخول (Google OAuth)
1. في **Google Cloud Console** (نفس مشروع الـ Apps Script): **APIs & Services → Credentials → Create OAuth client ID → Web application**.
2. أضِف نطاق GitHub Pages في **Authorized JavaScript origins**، مثال: `https://ictsru.github.io`.
3. انسخ **Client ID**.

## 4) إعداد الواجهة ونشرها على GitHub
1. انسخ `config.sample.js` إلى `config.js` واملأ:
   ```js
   API_URL: "https://script.google.com/.../exec",
   GOOGLE_CLIENT_ID: "xxxxx.apps.googleusercontent.com",
   ```
2. ارفع محتويات المجلد إلى مستودع (مثلاً **ICTSRU/RoomsDT**) وفعّل **GitHub Pages**.
3. الشعارات تُسحب من مستودع العلامة المشتركة `ICTSRU/brand`؛ عدّل مسارات `LOGO_*` في `config.js` عند الحاجة.

> **وضع العرض:** إذا تُرك `API_URL` و `GOOGLE_CLIENT_ID` فارغَين، تعمل الصفحة ببيانات البذرة للقراءة فقط (مفيد للعرض قبل الربط).

## 5) الأمن وتسجيل الدخول
- كل نداء للخادم يحمل بطاقة Google (JWT) ويُعاد التحقق منها على الخادم عبر `tokeninfo` والتأكد من أن النطاق `sr.edu.sa`.
- يُسجَّل كل دخول في تبويب `AccessLog` بالحقول: `Email, Date, Time, Action, Platform` — متوافق مع **ITOC Access Monitor**.
- الإضافة/التعديل مقصورة على `ADMIN_EMAILS`.

## 6) حقول تبويب `Rooms`
`RoomID · RoomName · Category · SourceType · Gender · Building · Capacity · Status · Devices · Specs · PhotoURLs · Notes · UpdatedBy · UpdatedAt`

- **Devices:** مصفوفة JSON — كل جهاز `{name, model, ip, specs:[[مفتاح,قيمة]...]}`؛ تُدار من نموذج الإضافة/التعديل (لا حاجة لتحريرها يدوياً). تُقرأ البيانات القديمة (نص مفصول) تلقائياً.
- **Specs:** حقل قديم محفوظ للتوافق (المواصفات الآن ضمن كل جهاز).
- **PhotoURLs:** روابط صور مفصولة بأسطر (تُضاف تلقائياً عند الرفع).

---
الإصدار 2.2 · 2026-11-19
