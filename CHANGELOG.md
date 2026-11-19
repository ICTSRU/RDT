# سجل التغييرات — التوأم الرقمي للقاعات / CHANGELOG — Rooms Digital Twin

يتبع هذا السجل ترقيم إصدار برقم عشري واحد (… 1.9 → 2.0).
Semantic single-decimal versioning (… 1.9 → 2.0).

## [2.5] — 2026-11-19
**العربية**
- تغيير اسم المنصة إلى **«منصة القاعات الرقمية»** (Digital Rooms Platform) في عنوان الصفحة والترويسة وشاشة الدخول والتذييل وصفحة GitHub وREADME.
- زر بطاقات المعرض أصبح «عرض تفاصيل القاعة».
- قيمة `Platform` في `AccessLog` بقيت `Rooms Digital Twin` للحفاظ على تجميع السجلات في ITOC Access Monitor.

**English**
- Platform renamed to **"منصة القاعات الرقمية" (Digital Rooms Platform)** across title, header, sign-in screen, footer, GitHub page and README.
- Gallery card button now reads "عرض تفاصيل القاعة".
- The `Platform` value written to `AccessLog` stays `Rooms Digital Twin` so ITOC Access Monitor history stays grouped.

## [2.4] — 2026-11-19
**العربية — قائمة المباني الرئيسية**
- قائمة «المباني» في شريط الفلاتر أصبحت المباني الرئيسية فقط بالترتيب: **Part 1 · Part 2 · Part 3 · Part 4 · Part 5 · Conference Hall** بدل الأسماء الخام (مثل `Part 4 - Female` / `Part 4 - Male`). اختيار «Part 4» يعرض قاعاته الـ 30 كلها (طالبات وطلاب).
- اعتماد **Part 5** ضمن المباني الرئيسية (21 قاعة).
- مزامنة بين القائمة وتبويبات مستكشف المباني في الاتجاهين، والقائمة مفعّلة في الطرق الثلاث.
- خانة «المبنى» في نموذج الإضافة/التعديل أصبحت قائمة منسدلة بالمباني الستة، مع الحفاظ على القيمة القديمة للقاعات المسجّلة (مثل `Part 4 - Female`) دون تغيير البيانات.

**English — main-building list**
- The "Buildings" filter now lists only the main buildings, in order: **Part 1 · Part 2 · Part 3 · Part 4 · Part 5 · Conference Hall**, instead of raw names (e.g. `Part 4 - Female` / `Part 4 - Male`). Choosing "Part 4" shows all 30 of its rooms.
- **Part 5** confirmed as a main building (21 rooms).
- Two-way sync between the dropdown and the Building Explorer tabs; the dropdown works in all three views.
- The "Building" field in the add/edit form is now a dropdown of the six buildings; existing rooms keep their stored value (e.g. `Part 4 - Female`) unchanged.

## [2.3] — 2026-11-19
**العربية — تعيين الأدوار تلقائياً من رقم القاعة**
- قاعدة الدور حسب أول رقم في رقم القاعة: **1 = الأرضي · 2 = الأول · 3 = الثاني · 4 = الثالث** (مثال: `(3254)` ← الثاني).
- تحديث لمرة واحدة يُطبَّق تلقائياً عند أول دخول للمشرف بعد النشر: يُعيَّن الدور لـ **118 قاعة من 124** (18 أرضي · 45 أول · 48 ثاني · 7 ثالث)، ويُكتب عمود الدور في عملية واحدة، ويُسجَّل في تبويب `_Meta` وفي `AccessLog`، ولا يُعاد تشغيله.
- طُبّقت القاعدة على جميع القاعات المرقّمة كما طُلب، بما فيها `SPSS Lab (1110)` (كانت «الأول» ← «الأرضي»).
- 6 قاعات بلا رقم في اسمها تبقى «غير محدد»: Library Meeting Room، Conference Hall، Auditorium (Female)، Auditorium (Male)، Multi-Purpose Hall 1 و 2.
- القاعات الجديدة: يُقترح الدور تلقائياً أثناء كتابة اسم القاعة في النموذج، ويُشتق عند الحفظ إن لم يُختر دور.
- دالة يدوية `applyFloorRuleNow()` لإعادة تطبيق القاعدة من محرر Apps Script عند الحاجة.
- اختُبر الكود الخادمي على نسخة من بيانات الـ Sheet الحية قبل النشر.

**English — automatic floors from the room number**
- Floor rule by the first digit of the room number: **1 = Ground · 2 = First · 3 = Second · 4 = Third** (e.g. `(3254)` → Second).
- One-time update that runs automatically on the admin's first visit after deploy: sets the floor for **118 of 124 rooms** (18/45/48/7), written as a single column update, recorded in a `_Meta` tab and in `AccessLog`, never re-run.
- Applied to every numbered room as requested, including `SPSS Lab (1110)` (First → Ground).
- 6 rooms with no number in their name stay "Unassigned".
- New rooms: the floor is suggested while typing the room name and derived on save when none is chosen.
- Manual `applyFloorRuleNow()` function to re-apply the rule from the Apps Script editor if needed.
- Server code tested against a copy of the live Sheet data before release.

## [2.2] — 2026-11-19
**العربية — مستكشف المباني: مبانٍ رئيسية + أدوار + تمييز قاعات الطالبات**
- تجميع المباني الرئيسية بغضّ النظر عن الفئة (مثل `Part 4 - Female` + `Part 4 - Male` ← **Part 4**) بالترتيب: Part 1 · Part 2 · Part 3 · Part 4 · Part 5 · Conference Hall.
- تبويبات أدوار ثابتة لمباني Part: **كل الأدوار · الأرضي · الأول · الثاني · الثالث** مع عدد القاعات لكل دور، وتبويب «غير محدد» للقاعات التي لم يُحدَّد دورها، وتنبيه عند عدم تعبئة الأدوار. Conference Hall بلا أدوار.
- **تمييز قاعات الطالبات بلون وردي واضح** مع شارة «طالبات»، وقاعات الطلاب بخلفية بيضاء؛ التصنيف يظهر كشريط ملوّن علوي ووسم نصي. ملخص المبنى يعرض عدد قاعات الطالبات والطلاب.
- شارة «طالبات» وردية أيضاً في لوحة التشغيل والمعرض البصري.
- خانة «الدور» في النموذج أصبحت قائمة منسدلة (الأرضي/الأول/الثاني/الثالث) لضمان تطابقها مع التبويبات، مع الحفاظ على أي قيمة قديمة مكتوبة يدوياً.
- تحسين داخلي: الوصول لحقول النموذج عبر `form.elements` القياسي.

**English — Building Explorer: main buildings + floors + female-room highlight**
- Main buildings grouped regardless of gender suffix (e.g. `Part 4 - Female` + `Part 4 - Male` → **Part 4**), ordered Part 1–5, then Conference Hall.
- Fixed floor tabs for Part buildings: **All · Ground · First · Second · Third** with per-floor counts, plus "Unassigned" and a hint when floors are not filled yet. No floors for Conference Hall.
- **Female rooms highlighted in a clear rose colour** with a "طالبات" badge; male rooms stay white; category shown as a top colour stripe + text label. Building summary shows female/male room counts.
- Rose "طالبات" pill added to the Console and Gallery views.
- The Floor field in the form is now a dropdown (Ground/First/Second/Third) to match the tabs; any legacy free-text value is preserved.
- Internal: form fields accessed via standard `form.elements`.

## [2.1] — 2026-11-19
**العربية — ثلاث طرق عرض قابلة للتبديل**
- مبدّل عرض في شريط الأدوات بين: **لوحة التشغيل** (جدول تشغيلي شامل) · **مستكشف المباني** (مخطط المبنى، مساحة كل قاعة تتناسب مع سعتها الفعلية، حول ممر، مع تبويبات المباني وفلتر الدور) · **المعرض البصري** (بطاقات بالصور وأسماء الأجهزة).
- شريط مؤشرات حيّ أعلى الصفحة: إجمالي القاعات، النشطة، غير النشطة، السعة الإجمالية، القاعات بأجهزة مسجّلة، القاعات بصور — محسوبة من البيانات الفعلية.
- خيار «ترتيب حسب» (الأكبر سعة / الاسم / المبنى) مشترك بين الطرق الثلاث، والفلاتر والبحث والتصنيفات تعمل على الثلاث.
- حفظ آخر طريقة عرض اختارها المستخدم تلقائياً.
- القاعات غير النشطة تظهر بحدود متقطّعة في المخطط؛ فلتر الدور يُفعَّل تلقائياً عند تعبئة خانة «الدور».
- اختُبرت الطرق الثلاث ببيانات القاعات الـ 124 الفعلية دون أخطاء.

**English — three switchable views**
- Toolbar view switcher: **Operations Console** (register table) · **Building Explorer** (schematic floor plan, tiles sized by real capacity around a corridor, building tabs + floor filter) · **Visual Gallery** (photo cards with device names).
- Live KPI strip computed from real data (total, active, inactive, total capacity, rooms with devices, rooms with photos).
- Shared "sort by" (capacity / name / building); search, filters and category tabs apply to all three views.
- The last chosen view is remembered per user.
- Inactive rooms render dashed on the plan; the floor filter enables itself once Floor data exists.
- All three views tested against the 124 real rooms with no errors.

## [2.0] — 2026-11-18
**العربية — تغيير معماري جذري (حل نهائي لمشكلة الاتصال)**
- أصبحت المنصة تُقدَّم من Apps Script نفسه عبر `HtmlService` (ملفات `Index.html` / `Style.html` / `Script.html`)، واستُبدل `fetch` بجسر `google.script.run` — فالاتصال الآن **بنفس الأصل تماماً: لا CORS ولا حاجة لوصول مجهول**.
- الأمان: النشر بصلاحية «Anyone within SRU» (يقصر الدخول على `@sr.edu.sa`)، وتُقرأ هوية المستخدم من الخادم عبر `Session.getActiveUser()`، ويُسجَّل الدخول في `AccessLog`. أُزيل تسجيل دخول Google Identity (لم يعد لازماً).
- صفحة GitHub صارت صفحة تحويل أنيقة تفتح رابط المنصة على Apps Script.
- حُدّث `appsscript.json` إلى `access: DOMAIN` ونطاق `userinfo.email`.

**English — radical architecture change (definitive connectivity fix)**
- The app is now served by Apps Script via `HtmlService` (`Index/Style/Script.html`); `fetch` replaced by the `google.script.run` bridge — calls are **same-origin: no CORS, no anonymous access needed**.
- Security: deploy as "Anyone within SRU" (restricts to `@sr.edu.sa`); identity read server-side via `Session.getActiveUser()`; sign-ins logged to `AccessLog`. Google Identity sign-in removed (no longer required).
- The GitHub page is now a styled redirect to the Apps Script app URL.
- `appsscript.json` set to `access: DOMAIN` with the `userinfo.email` scope.

## [1.9] — 2026-11-18
**العربية**
- إضافة كسر تخزين مؤقّت (cache-busting) بإلحاق `?v=1.9` بملفات `config.js` و `app.js` و CSS، فيُجبر المتصفح/شبكة GitHub على تحميل أحدث `config.js` (برابط النشرة العامة) بدل نسخة قديمة مخزَّنة — وهو السبب الأرجح لاستمرار خطأ CORS بعد تحديث الرابط.

**English**
- Added cache-busting (`?v=1.9` on `config.js`, `app.js`, CSS) so the browser/GitHub CDN always loads the newest `config.js` (with the public deployment URL) instead of a stale cached copy — the most likely reason the CORS error persisted after the URL fix.

## [1.8] — 2026-11-18
**العربية**
- تحديث رابط Web App في `config.js` إلى نشرة جديدة بصلاحية «Anyone» (صيغة `/macros/s/…/exec`) — هذا يحسم مشكلة «تعذّر الاتصال بالخادم».
- ملاحظة تشغيلية: يجب تحديث سرّ المستودع `DEPLOYMENT_ID` إلى معرّف النشرة الجديدة ليستمر النشر التلقائي على النشرة العامة نفسها.

**English**
- Updated the Web App URL in `config.js` to a new "Anyone"-access deployment (`/macros/s/…/exec`) — this resolves the "server connection failed" error.
- Ops note: repo secret `DEPLOYMENT_ID` must be updated to the new deployment ID so auto-deploy keeps targeting the public deployment.

## [1.7] — 2026-11-18
**العربية**
- رسائل خطأ دقيقة عند فشل الاتصال بالخادم: تمييز «رد الخادم بصفحة دخول (النشر ليس Anyone)» عن أخطاء الوصول/CORS، بدل رسالة «تعذّر الاتصال بالخادم» العامة. (الحل الجذري: ضبط صلاحية نشر Apps Script على «Anyone».)

**English**
- Precise error messages when the server call fails: distinguishes "server returned a login page (deployment not Anyone)" from access/CORS errors, replacing the generic "server connection failed". (Root fix: set the Apps Script deployment access to "Anyone".)

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
