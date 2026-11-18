# سجل التغييرات — التوأم الرقمي للقاعات / CHANGELOG — Rooms Digital Twin

يتبع هذا السجل ترقيم إصدار برقم عشري واحد (… 1.9 → 2.0).
Semantic single-decimal versioning (… 1.9 → 2.0).

## [1.0] — 2026-11-18
النسخة الأولى. / Initial release.

**العربية**
- واجهة استعراض القاعات على GitHub بهوية الجامعة ونمط الشبكة المعتمد (SRU Tech Background · Network v1.0).
- تصنيف القاعات إلى: قاعات المحاضرات · قاعات الاختبار · القاعات الدراسية · الفصول الدراسية · أخرى، مع عدّادات لكل تصنيف.
- بحث وفلاتر (المبنى، الفئة طلاب/طالبات، الحالة) وبطاقات قاعات تعرض الصورة الأولى وعدد الأجهزة.
- صفحة تفاصيل القاعة: معرض الصور الحقيقية، وسوم الأجهزة، جدول المواصفات، والبيانات الوصفية.
- شاشة دخول ITOC تسبق تسجيل دخول Google، مقيّدة بحسابات `@sr.edu.sa` (تحقق على الخادم).
- تسجيل كل عملية دخول (البريد، التاريخ، الوقت) في تبويب `AccessLog` بـ Google Sheet.
- إضافة/تعديل القاعات للمشرفين، ورفع الصور إلى Google Drive وحفظ روابطها تلقائياً.
- الخادم: Google Apps Script Web App + Google Sheet (تبويبات Rooms و AccessLog).
- تضمين بيانات ١٢٤ قاعة حقيقية من ملف RoomWWExport كبذرة أولية.

**English**
- GitHub front-end with SRU identity and the approved network background pattern.
- Five categories with live counts; search + filters (building, gender, status).
- Room detail: real-photo gallery, device tags, specs table, metadata.
- ITOC branded sign-in screen before Google sign-in, restricted to `@sr.edu.sa` (server-verified).
- Every sign-in logged (email, date, time) to the `AccessLog` tab.
- Admin add/edit rooms; photo upload to Google Drive with auto-saved URLs.
- Backend: Apps Script Web App + Google Sheet (Rooms, AccessLog tabs).
- Seeded with 124 real rooms from the RoomWWExport file.

### المخطط البياني للتصنيفات في هذا الإصدار
| التصنيف | عدد القاعات |
|---|---|
| القاعات الدراسية | 45 |
| الفصول الدراسية | 40 |
| قاعات المحاضرات | 24 |
| أخرى (اجتماعات/مقابلات) | 11 |
| قاعات الاختبار | 4 |
| **الإجمالي** | **124** |
