# سجل التغييرات — التوأم الرقمي للقاعات / CHANGELOG — Rooms Digital Twin

يتبع هذا السجل ترقيم إصدار برقم عشري واحد (… 1.9 → 2.0).
Semantic single-decimal versioning (… 1.9 → 2.0).

## [1.6] — 2026-11-18
**العربية**
- تصحيح شعار ITOC في تذييل الصفحة الداخلية (خلفية بيضاء مستديرة ليظهر فوق الخلفية الداكنة).
- إضافة تصنيف **«قاعات الاجتماعات»** إلى التبويبات ونموذج الإضافة/التعديل.
- إضافة خانة **«الدور»** لكل قاعة (نموذج + صفحة التفاصيل + بطاقة القاعة)، مع ترحيل آمن للعمود في Google Sheet تلقائياً دون المساس بالبيانات.
- إضافة **«اداريين»** و**«أعضاء هيئة التدريس»** إلى حقل الفئة وفلتر البحث.

**English**
- Fixed the ITOC logo in the internal-page footer (white rounded backdrop for legibility on the dark footer).
- Added a **"Meeting Halls"** category to the tabs and the add/edit form.
- Added a **"Floor"** field per room (form + detail + card), with safe automatic column migration in the Google Sheet that never touches existing data.
- Added **"Administrators"** and **"Faculty"** to the occupant-category field and the filter.

## [1.5] — 2026-11-18
**العربية**
- تفعيل الدخول الموحّد (SSO) التلقائي: `auto_select` + One-Tap، فإن كانت جلسة Google نشطة في المتصفح (مثل من دخل ITOC) يدخل المستخدم مباشرة دون زرّ أو اختيار حساب. شاشة التحقق بخطوتين تبقى من Google وتظهر فقط عند غياب جلسة Google.

**English**
- Enabled automatic single sign-on (SSO): `auto_select` + One-Tap, so a user with an active Google session (e.g. already signed into ITOC) is signed in silently without clicking or picking an account. Google's 2-step screen is Google's own and only appears when no Google session exists.

## [1.4] — 2026-11-18
**العربية**
- إصلاح «تعذّر الاتصال بالخادم»: تحويل رابط Web App إلى الشكل العام `/macros/s/.../exec` بدل الشكل المقيّد بالنطاق `/a/macros/sr.edu.sa/.../exec` الذي يكسر نداء المتصفح من GitHub. الأمان يبقى محفوظاً عبر التحقق من رمز Google ونطاق `@sr.edu.sa` داخل `Code.gs` (يتطلّب ضبط صلاحية النشر على "Anyone").

**English**
- Fixed "server connection failed": switched the Web App URL to the public `/macros/s/.../exec` form instead of the domain-restricted `/a/macros/sr.edu.sa/.../exec` form that breaks browser calls from GitHub. Security is still enforced by the Google-token + `@sr.edu.sa` domain check in `Code.gs` (requires the deployment's access set to "Anyone").

## [1.3] — 2026-11-18
**العربية**
- إصلاح رسالة «تعذّر تحميل خدمة تسجيل الدخول»: أصبح النظام ينتظر تحميل مكتبة Google (GIS) غير المتزامنة (حتى ٦ ثوانٍ) قبل إظهار الزر، مع زر «إعادة المحاولة» عند الفشل.
- تصحيح شكل شعار ITOC في شاشة الدخول: وُضع على خلفية بيضاء مستديرة ليظهر بوضوح فوق التدرّج البنفسجي.

**English**
- Fixed the "sign-in service failed to load" message: the app now waits for the async Google Identity Services library (up to 6s) before showing the button, with a Retry button on failure.
- Fixed the ITOC logo on the sign-in screen: placed on a white rounded backdrop so it reads clearly over the purple gradient.

## [1.2] — 2026-11-18
**العربية**
- ربط الخادم بالمعرّفات الفعلية: `SHEET_ID` (شيت القاعات) و `PHOTO_FOLDER_ID` (مجلد صور القاعات) و `GOOGLE_CLIENT_ID`.
- إضافة خط النشر التلقائي `.github/workflows/deploy.yml` (clasp) باستخدام أسرار المستودع `CLASPRC_JSON · SCRIPT_ID · DEPLOYMENT_ID`؛ النشر بـ `-i DEPLOYMENT_ID` يُبقي رابط Web App ثابتاً.

**English**
- Wired the backend to live IDs: `SHEET_ID`, `PHOTO_FOLDER_ID`, `GOOGLE_CLIENT_ID`.
- Added `.github/workflows/deploy.yml` (clasp auto-deploy) using repo secrets `CLASPRC_JSON · SCRIPT_ID · DEPLOYMENT_ID`; `-i DEPLOYMENT_ID` keeps the Web App URL constant.

## [1.1] — 2026-11-18
**العربية**
- إعادة تصميم إدخال الأجهزة: يُضاف كل جهاز على حدة بحقول **اسم الجهاز · الموديل · عنوان IP**، مع إمكانية إضافة **مواصفات أخرى** (مفتاح/قيمة) لكل جهاز.
- صفحة تفاصيل القاعة تعرض كل جهاز كبطاقة مستقلة بجدول مواصفاته.
- تُخزَّن الأجهزة كمصفوفة JSON في نفس عمود `Devices` (لا تغيير في بنية Google Sheet)، مع قراءة متوافقة للبيانات القديمة.

**English**
- Reworked device entry: each device added individually with **name · model · IP address**, plus optional **extra specs** (key/value) per device.
- Room detail shows each device as its own card with a specs table.
- Devices stored as a JSON array in the same `Devices` column (no Sheet schema change); legacy values still read correctly.

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
