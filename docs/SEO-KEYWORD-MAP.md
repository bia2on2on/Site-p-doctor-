# SEO Keyword Map — نقشه معماری Intent جست‌وجو و کلمات کلیدی CPMS

**وضعیت سند:** برنامه‌ریزی/معماری SEO — **پیشنهادی**، سند مستنداتی محض؛ هیچ Gate را Passed نمی‌کند و هیچ پیاده‌سازی/کد/Plugin/Theme/Tag را مجاز نمی‌کند.

**تاریخ این نسخه:** 2026-09-27 (UTC) — نسخهٔ اول

**نقش این سند:** مرجع authoritative معماری Search Intent و کلمات کلیدی برای دو مسیر تجاری سایت (نرم‌افزار CPMS و سرویس مکمل راه‌اندازی وب‌سایت)، بر اساس اصول رسمی Google Search Central/web.dev و بدون هیچ عدد حجم جست‌وجو یا ادعای رتبه‌ای ساختگی.

**ارجاعات و تقسیم مسئولیت سند:**

| سند | نقش | این سند با آن چه می‌کند |
|---|---|---|
| `AGENTS.md` | قواعد عملیاتی، گیت‌ها، Marketing Truth، بازنشستگی Writer | رعایت می‌کند؛ جایگزین آن نمی‌شود |
| `docs/ROADMAP.md` §11 (SEO Architecture) و §10 (Content/Blog) | مرجع الزامات SEO Foundation/Hardening و Topic Proposalهای اولیه | این سند همان الزام SEO Foundation (§11.1) را با کلاسترهای مشخص، بدون عدد، اجرا می‌کند؛ Topic Proposalهای §10 را به Cluster 8 نگاشت می‌دهد |
| `docs/SITE-ARCHITECTURE.md` §5 (معماری URL/SEO Intent) و §5.4 (مالکیت Cluster) | قرارداد اجرایی URL/Intent/مالکیت head-term و Backlog اعتبارسنجی سرویس مکمل | این سند **جایگزین §5 نمی‌شود**؛ آن قرارداد را با یک نقشهٔ کلاستر/مالکیت/صفحه تکمیل می‌کند و به شماره‌بخش ارجاع می‌دهد |
| `docs/PRODUCT-TRUTH.md` | مرجع زنده کنترل ادعا (Claim Control) | هر Cluster/Keyword که به قابلیت محصول متکی است، از آن فیلتر می‌شود (بخش E) |
| `docs/AGENT-TOOLING.md` §4.1 | حاکمیت ابزار retrieval (Context7) | ارجاع می‌دهد؛ مرجع نهایی مستندات رسمی Google/web.dev است، نه حافظهٔ مدل |

**این سند عمداً نیست:**

- Keyword Research نهایی با حجم جست‌وجو/CPC/رقابت واقعی — هیچ عددی در این سند ابداع **نمی‌شود**؛
- کپی نهایی صفحات یا Meta Title/Description نهایی؛
- تصمیم نهایی الگوی Slug فارسی/انگلیسی (همچنان `REQUIRES KEYWORD RESEARCH` طبق `SITE-ARCHITECTURE §5.1`)؛
- مجوز ساخت صفحهٔ سرویس مکمل طراحی وب‌سایت — آن صفحه همچنان `CONDITIONAL ON BUSINESS READINESS + SERVICE DEFINITION` است (`SITE-ARCHITECTURE §4.3/§0.2`)؛
- نصب/پیکربندی هیچ ابزار SEO، Search Console، Analytics یا Tag.

---

## A. هدف استراتژیک و دو مسیر تجاری جست‌وجو (Strategic Intent & Two Commercial Tracks)

استراتژی جست‌وجوی سایت روی **دو مسیر تجاری مجزا اما مرتبط** ساخته می‌شود. هر دو مسیر باید کلمات کلیدی، صفحهٔ مالک و محتوای خودشان را داشته باشند تا از هم‌خوری (cannibalization) و رقیق‌شدن Positioning جلوگیری شود (بخش D).

### A.1 مسیر اصلی — نرم‌افزار مدیریت کلینیک (Primary Software Track / CPMS)

- **مخاطب:** مدیران/صاحبان کلینیک، مراکز چندپزشکی و پزشکان مستقل که به‌دنبال نرم‌افزار مدیریت مطب/کلینیک، نوبت‌دهی، پرونده و جریان‌های کاری عملیاتی هستند؛
- **نقش تجاری:** موضوع/محصول **اصلی** سایت (`SITE-ARCHITECTURE §1.1/§2.1` — CPMS همچنان primary)؛
- **Conversion هدف:** درخواست دمو/مشاوره (`ROADMAP §8`، `SITE-ARCHITECTURE §13`)؛
- این مسیر Clusterهای ۱ تا ۶ و بخشی از Cluster ۸ را پوشش می‌دهد.

### A.2 مسیر مکمل — راه‌اندازی وب‌سایت مرتبط با پذیرش CPMS (Complementary Website Setup Track)

- **مخاطب:** پزشکان و کلینیک‌هایی که **هم‌زمان** نیاز به CPMS دارند **و** وب‌سایت مناسبِ مرتبط با راه‌اندازی/پذیرش CPMS ندارند؛ **نه** هر کسب‌وکاری که صرفاً به‌دنبال طراحی سایت عمومی است؛
- **مرز صریح:** این مسیر **آژانس طراحی وب عمومی نیست**. واجدالشرایط‌سازی (qualification) پیش از ورود به این مسیر الزامی است (`SITE-ARCHITECTURE §1.6` — «مکمل، نه جایگزین» + «مشروط به واجدالشرایط‌سازی»)؛
- **وضعیت انتشار:** این مسیر و صفحهٔ احتمالی آن `CONDITIONAL ON BUSINESS READINESS + SERVICE DEFINITION` هستند (`SITE-ARCHITECTURE §0.2/§4.3`) — یعنی مانع، شواهد قابلیت محصول نیست بلکه **دو پیش‌نیاز تجاری/عملیاتی**: تأیید مالک محصول مبنی بر آماده‌بودن سرویس، و تعریف دقیق دامنه/تحویل/قیمت سرویس (`BUSINESS INPUT REQUIRED`)؛
- این مسیر Cluster ۷ و بخشی از Cluster ۸ را پوشش می‌دهد.

### A.3 قاعدهٔ حاکم بین دو مسیر

- CPMS **موضوع اصلی** سایت می‌ماند؛ مسیر مکمل هرگز Positioning اصلی، مخاطب اصلی یا Conversion اصلی را جابه‌جا نمی‌کند؛
- دو مسیر **کلمات کلیدی، صفحهٔ مالک و مسیر تبدیل جداگانه** دارند (بخش D)؛ هیچ صفحهٔ CPMS نباید برای عبارات «طراحی سایت …» بهینه شود و برعکس؛
- تبدیل مسیر مکمل به «فروش وب‌سایت برای همه مشاغل» یا تکثیر صفحه بر اساس شهر/تخصص، **ممنوع** است (`SITE-ARCHITECTURE §1.6` جدول قواعد + §5.4.3).

---

## B. خط پایهٔ کیفیت جست‌وجوی Google (Google Search Quality Baseline)

تمام تصمیم‌های SEO این سند و هر Content Brief آینده باید بر پایهٔ **راهنمای رسمی جاری Google Search Central** و **web.dev** باشد، نه حدس یا حافظهٔ مدل (`SITE-ARCHITECTURE §5.4.4`؛ `AGENT-TOOLING §4.1`). اصول زیر خط پایهٔ الزامی است:

1. **People-first، محتوای واقعاً مفید (Helpful Content / E-E-A-T):** هر صفحه باید برای مخاطب انسانی واقعی نوشته شود، نه برای موتور جست‌وجو؛ تجربه (Experience)، تخصص (Expertise)، اعتبار (Authoritativeness) و اعتمادپذیری (Trustworthiness) باید از شواهد واقعی محصول/شرکت بیاید، نه ادعای بدون سند (`ROADMAP §16`؛ `PRODUCT-TRUTH §4`).
2. **ممنوعیت Doorway Pages و صفحات شهر-تکراری:** هیچ صفحهٔ انبوه با الگوی «طراحی سایت پزشک در مشهد/اصفهان/تبریز/…» یا معادل شهر-به-شهر برای هیچ‌یک از دو مسیر ساخته نمی‌شود. این الگو دقیقاً همان چیزی است که سیاست‌های اسپم Google آن را Doorway Page می‌شناسد و در `SITE-ARCHITECTURE §1.6` (ضد رقیق‌شدن) و §5.4.3 (ممنوعیت‌های محتوایی/فنی سرویس) صریحاً منع شده است.
3. **ممنوعیت محتوای برنامه‌ای/انبوه کم‌ارزش (Programmatic Thin Content):** تولید صفحات مشابه با جابجایی صرف کلمهٔ کلیدی (شهر، تخصص، محله) بدون ارزش محتوایی متمایز، ممنوع است. هر صفحهٔ جدید باید محتوای واقعی، متفاوت و مفید داشته باشد.
4. **بدون هیچ تضمین رتبه، ایندکس یا صفر-خطای دائمی:** این سند و هیچ سند آیندهٔ SEO **هیچ تضمینی** برای رتبهٔ جست‌وجو، حجم ترافیک، سرعت ایندکس‌شدن یا نبود هشدار/خطای Google در طول زمان نمی‌دهد. Google ممکن است رفتارهایی نشان دهد که نقص سایت نیست (`SITE-ARCHITECTURE §19` مرز صریح و واژگان `GOOGLE BEHAVIOR — NOT A SITE DEFECT`). تعهد قابل‌اجرا، **فرآیند و کیفیت**، نه نتیجهٔ تضمینی است.
5. **ایندکس‌پذیری فنی تمیز، ثبات Canonical، لینک‌های قابل‌خزش:** الزامات فنی (Canonical یکتا، عدم Duplicate/Thin Archive، لینک داخلی واقعی و قابل‌خزش، عدم Soft-404، ثبات URL) طبق `SITE-ARCHITECTURE §5` و §19.2 حاکم است و این سند آن را تکرار نمی‌کند، فقط به آن ارجاع می‌دهد.
6. **بدون Keyword Stuffing، متن پنهان، لینک خریداری‌شده یا تاکتیک اسپم:** هیچ صفحه یا محتوای آیندهٔ این نقشه نباید انباشت کلمهٔ کلیدی، متن پنهان، Cloaking، لینک‌سازی خریداری‌شده یا هر تاکتیک منع‌شده در سیاست‌های اسپم Google داشته باشد (`ROADMAP §11`؛ بخش F همین سند).
7. **مرجع‌سازی زنده:** پیش از هر پیاده‌سازی عمدهٔ SEO و مجدداً پیش از Launch، راهنمای رسمی جاری Google باید بازبینی شود (`SITE-ARCHITECTURE §5.4.4`)؛ نسخهٔ منجمدشدهٔ این راهنماها در این سند ثبت **نمی‌شود**.

---

## C. کلاسترهای Search Intent و معماری کلمات کلیدی (Search Intent Clusters & Keyword Architecture)

**قاعدهٔ الزامی برای همهٔ جداول این بخش:** هیچ عدد حجم جست‌وجو، CPC، رقابت یا اولویت رتبه‌بندی در این سند وجود ندارد و ابداع **نمی‌شود**. هر ردیف حجم جست‌وجو با مقدار ثابت زیر علامت‌گذاری می‌شود:

> **`VOLUME NOT RETRIEVED`** — حجم جست‌وجو اندازه‌گیری نشده است؛ تحقیق کمّی واقعی (ابزار/دادهٔ معتبر) به فاز SEO Foundation (`ROADMAP §11.1`) موکول است.

ستون «Product-Truth Status» هر عبارت را به وضعیت بخش E این سند ارجاع می‌دهد. ستون «صفحهٔ مالک» فقط **نوع صفحه** را نشان می‌دهد (نه نام Slug نهایی)؛ تصمیم نهایی Slug همچنان `REQUIRES KEYWORD RESEARCH` است.

### Cluster 1 — نرم‌افزار مدیریت کلینیک/مطب (Primary Clinic Management Software)

**Intent:** تجاری/ناوبری — تصمیم‌گیرندهٔ کلینیک به‌دنبال نرم‌افزار یکپارچهٔ مدیریت کلینیک/مطب است.

| عبارت نمونه (فقط ورودی معماری، نه هدف نهایی) | Intent | Product-Truth Status | صفحهٔ مالک (نوع) | حجم |
|---|---|---|---|---|
| نرم افزار مدیریت کلینیک | تجاری | REQUIRES PRODUCT VERIFICATION — یکپارچگی محصول (`PRODUCT-TRUTH §3 #1/#3`) | Product Overview | `VOLUME NOT RETRIEVED` |
| نرم افزار مدیریت مطب | تجاری | REQUIRES PRODUCT VERIFICATION | Product Overview | `VOLUME NOT RETRIEVED` |
| سیستم مدیریت کلینیک | تجاری/اطلاعاتی مرزی | REQUIRES PRODUCT VERIFICATION | Product Overview | `VOLUME NOT RETRIEVED` |
| سیستم مدیریت کلینیک چیست | اطلاعاتی | بدون ادعای قابلیت مستقیم؛ آموزشی | Blog (Cornerstone) → لینک به Product Overview | `VOLUME NOT RETRIEVED` |
| نرم افزار یکپارچه کلینیک | تجاری | REQUIRES PRODUCT VERIFICATION — یکپارچگی (`PRODUCT-TRUTH §3 #1`) | Product Overview | `VOLUME NOT RETRIEVED` |

**مالکیت:** طبق قاعدهٔ §5.4.3 سند `SITE-ARCHITECTURE`، **دقیقاً یک صفحه** (کاندید: Product Overview) مالک این Cluster است؛ Home فقط لینک می‌دهد و رقابت نمی‌کند (بخش D).

### Cluster 2 — نوبت‌دهی کلینیک/مطب (Clinic & Doctor Scheduling)

**Intent:** تجاری/عملیاتی — نیاز به ابزار نوبت‌دهی و مدیریت تقویم پزشک/کلینیک.

| عبارت نمونه | Intent | Product-Truth Status | صفحهٔ مالک (نوع) | حجم |
|---|---|---|---|---|
| نرم افزار نوبت دهی کلینیک | تجاری | REQUIRES PRODUCT VERIFICATION — مکانیسم نوبت‌دهی ثبت‌شده؛ Public Booking مستقل تأیید نشده (`PRODUCT-TRUTH §3` تکمیلی «Appointment / Public Booking») | Feature Page (Appointment Management) — کاندیدای `CONDITIONAL ON PRODUCT TRUTH`، `SITE-ARCHITECTURE §4.3` | `VOLUME NOT RETRIEVED` |
| سیستم نوبت دهی مطب | تجاری | REQUIRES PRODUCT VERIFICATION | Feature Page (Appointment Management) | `VOLUME NOT RETRIEVED` |
| نوبت دهی آنلاین پزشک | تجاری — **احتیاط:** ممکن است انتظار Public Booking عمومی ایجاد کند | REQUIRES PRODUCT VERIFICATION؛ تا تأیید Public Booking، این عبارت **DEFERRED** برای هدف‌گیری مستقیم | Feature Page (مشروط) | `VOLUME NOT RETRIEVED` |
| برنامه ریزی نوبت پزشکان | اطلاعاتی/عملیاتی | REQUIRES PRODUCT VERIFICATION | Blog → Feature Page | `VOLUME NOT RETRIEVED` |

### Cluster 3 — پذیرش و صف انتظار (Reception & Patient Queue)

**Intent:** تجاری/عملیاتی — مدیریت پذیرش، ورود بیمار، صف/انتظار.

| عبارت نمونه | Intent | Product-Truth Status | صفحهٔ مالک (نوع) | حجم |
|---|---|---|---|---|
| مدیریت پذیرش کلینیک | تجاری | REQUIRES PRODUCT VERIFICATION — **فاز Reception در Snapshot بسته نشده بود** (`PRODUCT-TRUTH §3 #9`) | Feature Page (Reception & Queue) — `CONDITIONAL ON PRODUCT TRUTH` تا بسته‌شدن فاز #9 | `VOLUME NOT RETRIEVED` |
| نرم افزار مدیریت صف انتظار مطب | تجاری | REQUIRES PRODUCT VERIFICATION (#9، #12) | Feature Page (Reception & Queue) | `VOLUME NOT RETRIEVED` |
| مدیریت صف بیماران | عملیاتی/اطلاعاتی | REQUIRES PRODUCT VERIFICATION (#12 Queue/Waiting Workflow) | Blog → Feature Page | `VOLUME NOT RETRIEVED` |

**هشدار Product-Truth:** طبق `PRODUCT-TRUTH §3 #9`، فاز کامل Reception در Snapshot ثبت‌شده **بسته نشده بود**. هیچ صفحه یا Meta Description برای این Cluster نباید ادعای «قابلیت کامل و تحویل‌شده» کند تا بازتأیید در Launch Truth Gate انجام شود.

### Cluster 4 — پروندهٔ الکترونیک بیمار (Electronic Patient Records — Clinic-Scoped)

**Intent:** تجاری/اطلاعاتی — نگهداری و دسترسی به پروندهٔ بیمار در محدودهٔ یک کلینیک.

| عبارت نمونه | Intent | Product-Truth Status | صفحهٔ مالک (نوع) | حجم |
|---|---|---|---|---|
| پرونده الکترونیک بیمار | تجاری/اطلاعاتی | REQUIRES PRODUCT VERIFICATION (`PRODUCT-TRUTH §3 #10 Patient Records`) — **فقط در محدودهٔ یک کلینیک، بدون ادعای سامانهٔ ملی** | Feature Page (Patient Records) — `CONDITIONAL ON PRODUCT TRUTH` | `VOLUME NOT RETRIEVED` |
| پرونده الکترونیک سلامت | **ممنوع برای هدف‌گیری مستقیم** — ریسک اشتباه‌گرفتن با «پروندهٔ الکترونیک سلامت ملی ایران» | NOT ALLOWED به‌عنوان ادعا؛ اگر محتوایی نوشته شود باید صراحتاً محدودهٔ کلینیکی را روشن کند، نه سامانهٔ ملی | — (اگر اصلاً هدف‌گیری شود، فقط با Disclaimer صریح) | `VOLUME NOT RETRIEVED` |
| سوابق پزشکی بیمار در کلینیک | اطلاعاتی | REQUIRES PRODUCT VERIFICATION (#10) | Feature Page / Blog | `VOLUME NOT RETRIEVED` |

**مرز الزامی:** طبق `PRODUCT-TRUTH §4` (فهرست ممنوعه)، **هیچ ادعای اتصال به نسخهٔ الکترونیک ملی ایران یا سامانهٔ پروندهٔ الکترونیک سلامت کشوری** مجاز نیست. هر محتوای این Cluster باید صراحتاً «در محدودهٔ همان کلینیک/سازمان» بودن پرونده را روشن کند.

### Cluster 5 — عملیات چندپزشکی و چندموقعیتی کلینیک (Multi-Doctor & Multi-Location Clinic Operations)

**Intent:** تجاری — کلینیک‌های چندپزشکی/چندشعبه به‌دنبال ابزار مدیریت سازمانی.

| عبارت نمونه | Intent | Product-Truth Status | صفحهٔ مالک (نوع) | حجم |
|---|---|---|---|---|
| نرم افزار مدیریت کلینیک چندپزشکی | تجاری | REQUIRES PRODUCT VERIFICATION — شواهد فنی قوی برای معماری Multi-Clinic ثبت شده؛ مجوز انتشار عمومی `REVERIFY BEFORE PUBLIC LAUNCH` (`PRODUCT-TRUTH §3 #3`) | Solutions Hub → Segment «کلینیک‌های چندپزشکی» (`SITE-ARCHITECTURE §4.4`) | `VOLUME NOT RETRIEVED` |
| مدیریت چند شعبه کلینیک | تجاری | همان بالا (#3) | Solutions (Segment مشروط) | `VOLUME NOT RETRIEVED` |
| نرم افزار مدیریت مراکز درمانی بزرگ | تجاری | **DEFERRED — فقط اگر شواهد Launch واقعاً پشتیبانی کند** (`PRODUCT-TRUTH §3 #3/#5`؛ `SITE-ARCHITECTURE §4.4` Segment «مراکز بزرگ‌تر») | Solutions (Segment Deferred) | `VOLUME NOT RETRIEVED` |

### Cluster 6 — ثبت مالی/تراکنش کلینیک (Clinic Financial & Transaction Recording — Strictly Non-Accounting)

**Intent:** تجاری/عملیاتی — ثبت هزینه، صورتحساب، دریافت دستی وجه.

| عبارت نمونه | Intent | Product-Truth Status | صفحهٔ مالک (نوع) | حجم |
|---|---|---|---|---|
| نرم افزار ثبت مالی کلینیک | تجاری | REQUIRES PRODUCT VERIFICATION — هزینه/صورتحساب/ثبت دستی/Void-Refund/رسید موجود؛ **معادل حسابداری نیست** (`PRODUCT-TRUTH §3 #2`) | Feature Page (Finance) — `CONDITIONAL ON PRODUCT TRUTH` | `VOLUME NOT RETRIEVED` |
| نرم افزار حسابداری مطب | **NOT ALLOWED برای هدف‌گیری مستقیم** — سیستم حسابداری کامل/دفاتر عمومی در فهرست ممنوعه است (`PRODUCT-TRUTH §4`) | NOT ALLOWED | — | `VOLUME NOT RETRIEVED` |
| درگاه پرداخت آنلاین مطب | **NOT ALLOWED** — درگاه پرداخت آنلاین تأییدشده وجود ندارد (`PRODUCT-TRUTH §3 #2`, §4) | NOT ALLOWED | — | `VOLUME NOT RETRIEVED` |
| ثبت هزینه و دریافتی کلینیک | تجاری/اطلاعاتی | REQUIRES PRODUCT VERIFICATION (#2) — بدون ادعای Online Payment | Feature Page (Finance) | `VOLUME NOT RETRIEVED` |

**مرز الزامی:** طبق `PRODUCT-TRUTH §3 #2` و §4، هیچ محتوای این Cluster نباید کلمات «حسابداری کامل»، «دفتر کل»، «درگاه پرداخت آنلاین» یا معادل آن‌ها را به‌عنوان قابلیت هدف قرار دهد.

### Cluster 7 — راه‌اندازی وب‌سایت مکمل پزشک/مطب/کلینیک (Complementary Medical Website Setup)

**Intent:** تجاری/سرویس‌محور — کاربر به‌دنبال «ساخت/طراحی سایت» است، نه لزوماً نرم‌افزار مدیریت کلینیک؛ این Cluster **جدا و اختصاصی** برای مسیر A.2 است.

| عبارت نمونه (وارد از Backlog `SITE-ARCHITECTURE §5.4.2`) | Intent | وضعیت طبقه‌بندی | صفحهٔ مالک (نوع) | حجم |
|---|---|---|---|---|
| طراحی سایت پزشک | سرویس/تجاری | `POTENTIAL COMMERCIAL SERVICE INTENT — REQUIRES DEDICATED KEYWORD VALIDATION` (`SITE-ARCHITECTURE §5.4.1`) | Website Setup Service Page — `CONDITIONAL ON BUSINESS READINESS + SERVICE DEFINITION` | `VOLUME NOT RETRIEVED` |
| طراحی سایت پزشکی | سرویس/تجاری | همان بالا | همان صفحه (مشروط) | `VOLUME NOT RETRIEVED` |
| طراحی سایت مطب | سرویس/تجاری | همان بالا | همان صفحه (مشروط) | `VOLUME NOT RETRIEVED` |
| طراحی سایت کلینیک | سرویس/تجاری | همان بالا | همان صفحه (مشروط) | `VOLUME NOT RETRIEVED` |
| طراحی سایت نوبت دهی / نوبت گیری پزشک | سرویس/تجاری، مبهم با Cluster 2 | همان بالا — **ریسک ابهام با نرم‌افزار نوبت‌دهی؛ نیازمند ابهام‌زدایی در brief آینده** | همان صفحه (مشروط)؛ **هرگز** Feature Page نوبت‌دهی (Cluster 2) | `VOLUME NOT RETRIEVED` |
| ساخت سایت پزشک | سرویس/تجاری | همان بالا | همان صفحه (مشروط) | `VOLUME NOT RETRIEVED` |
| طراحی سایت برای مطب | سرویس/تجاری | همان بالا | همان صفحه (مشروط) | `VOLUME NOT RETRIEVED` |

**ممنوعیت‌های صریح این Cluster (بدون استثناء):**

- **بدون صفحهٔ شهر × خدمت** (مثال ممنوع: «طراحی سایت پزشک در مشهد/اصفهان/تبریز/…»)؛
- **بدون صفحهٔ تخصص × خدمت انبوه** (مثال ممنوع: «طراحی سایت پزشک دندانپزشک/پوست/زنان/…» به‌صورت صفحات تکراری)؛
- **بدون Doorway Page یا محتوای Duplicate با جابجایی کلمهٔ کلیدی**؛
- این Cluster تا برآورده‌شدن هر دو شرط `CONDITIONAL ON BUSINESS READINESS + SERVICE DEFINITION` (`SITE-ARCHITECTURE §0.2`) **هیچ صفحهٔ منتشرشده‌ای ندارد**؛ فقط جایگاه معماری رزرو است.

### Cluster 8 — راهنماهای اطلاعاتی/عملیاتی (Informational & Operational Guides — High-Intent)

**Intent:** اطلاعاتی با پتانسیل تبدیل بالا — تصمیم‌گیرنده در مرحلهٔ آموزش/مقایسه است، پیش از تصمیم خرید.

| موضوع نمونه (از `ROADMAP §10` Topic Proposal) | Intent | مسیر تجاری مرتبط | صفحهٔ مالک (نوع) | حجم |
|---|---|---|---|---|
| سیستم مدیریت کلینیک چیست؟ | اطلاعاتی/TOFU | مسیر A.1 (CPMS) | Blog (Cornerstone) → Product Overview | `VOLUME NOT RETRIEVED` |
| دیجیتالی‌کردن فرآیندهای کلینیک | اطلاعاتی/TOFU | مسیر A.1 | Blog → Product Overview / Features | `VOLUME NOT RETRIEVED` |
| چگونه کلینیک چندپزشکی را مدیریت کنیم | اطلاعاتی/میانهٔ Funnel | مسیر A.1 | Blog → Solutions (Segment) | `VOLUME NOT RETRIEVED` |
| نسخهٔ دیجیتال در مطب چیست | اطلاعاتی | مسیر A.1 — REQUIRES PRODUCT VERIFICATION (#11؛ **بدون ادعای اتصال نسخهٔ الکترونیک ملی**) | Blog → Feature Page (Prescriptions) | `VOLUME NOT RETRIEVED` |
| چرا مطب/کلینیک به وب‌سایت نیاز دارد (در کنار نرم‌افزار مدیریت) | اطلاعاتی/سرویس‌محور | مسیر A.2 — فقط اگر Cluster 7 فعال شود | Blog (اختصاصی مسیر A.2) → Website Setup Service Page | `VOLUME NOT RETRIEVED` |

**قاعده:** هر مقالهٔ این Cluster باید در انتها به **دقیقاً یک صفحهٔ تجاری مالک** لینک دهد (بخش D)؛ محتوای اطلاعاتی جایگزین صفحهٔ تجاری نمی‌شود و رقابت‌کنندهٔ آن هم نیست.

---

## D. نقشهٔ مالکیت صفحه-به-Query (ضد هم‌خوری سخت‌گیرانه)

**اصل بنیادین:** هر Head Term تجاری **دقیقاً یک صفحهٔ مالک** دارد. هیچ عبارت کلیدی تجاری اصلی نباید عمداً بین Home، Features و Solutions (یا هر دو صفحه) تقسیم شود.

| نوع Query | صفحهٔ مالک انحصاری | صفحاتی که **اجازهٔ رقابت ندارند** | مکانیزم |
|---|---|---|---|
| Head term نرم‌افزار مدیریت کلینیک/مطب (Cluster 1) | **یک** صفحهٔ اصلی محصول (کاندید: Product Overview؛ می‌تواند طبق برief رسمی به صفحهٔ دیگری از همان مجموعهٔ محصول منتقل شود، اما مالک همیشه **یکی** می‌ماند — `SITE-ARCHITECTURE §5.4.3`) | Home، Features Hub، Solutions Hub — این صفحات فقط **لینک** می‌دهند، هدف‌گیری مستقیم نمی‌کنند | Canonical یکتا + Internal Link از Home/Hub به صفحهٔ مالک |
| Query مربوط به یک قابلیت مشخص (نوبت‌دهی، پذیرش، پرونده، مالی — Clusterهای ۲–۶) | **صفحهٔ Feature اختصاصی همان قابلیت**، پس از تبدیل به `CORE`/فعال‌شدن (`SITE-ARCHITECTURE §4.3`) | Home، Product Overview (فقط معرفی خلاصه و لینک، نه رقابت روی همان head term)، Features Hub (فقط فهرست) | هر Feature Page یک H1 اختصاصی + Canonical مستقل |
| Query سناریو-محور (چندپزشکی، چندشعبه، مطب مستقل — Cluster ۵) | **Solutions Hub یا Segment Page مربوطه** (`SITE-ARCHITECTURE §4.4`) | Home، Product Overview | Segment آرشیو زیر `/solutions/` |
| Query «طراحی سایت …» (Cluster ۷) | **منحصراً صفحهٔ سرویس مکمل** (Website Setup Service Page) — پس از فعال‌شدن | **هرگز** CPMS software pages (Home، Product Overview، Features، Solutions) | جداسازی کامل namespace/URL و بدون لینک متقابل تبلیغاتی از صفحات محصول به‌جز اشارهٔ کوتاه در گفت‌وگوی فروش (`SITE-ARCHITECTURE §13.5`) |
| Query اطلاعاتی/آموزشی (Cluster ۸) | **مقالهٔ Blog مربوطه** | هیچ صفحهٔ تجاری نباید محتوای بلاگ را کپی/تکرار کند | لینک صعودی (Upward Link) از مقاله به صفحهٔ تجاری مالک؛ بدون لینک نزولی رقابتی |
| Homepage (`/`) | برند، Positioning اصلی، مسیریابی (Navigation Routing) | **هیچ Head Term قابلیت/سرویس مشخصی** | Home فقط چارچوب A–I (`SITE-ARCHITECTURE §3`) را اجرا می‌کند؛ هدف‌گیری Keyword مستقیم روی Head Termهای تجاری برای Home ممنوع است |

**قاعدهٔ لینک‌سازی بالادستی/پایین‌دستی:**

- **از پایین به بالا:** Blog (Cluster 8) → Feature/Solution/Product Overview مربوطه؛
- **از بالا به پایین:** Home → Product Overview/Features Hub/Solutions Hub (نه صفحات جزئی مستقیم، مگر برای CTA اصلی)؛
- **افقی ممنوع:** هیچ Feature Page نباید برای Head Term یک Feature دیگر بهینه شود؛
- **بین دو مسیر:** هیچ لینک تبلیغاتی/دائمی بین صفحات محصول CPMS و صفحهٔ سرویس مکمل به‌جز ارجاع کوتاه و کاربردی در گفت‌وگوی فروش/FAQ مجاز نیست (بدون رقیق‌شدن Positioning — `SITE-ARCHITECTURE §1.6`).

---

## E. مرزبندی Product-Truth بر کلمات کلیدی (Product-Truth Boundary Enforcement)

هر هدف کلمهٔ کلیدی باید مقابل `docs/PRODUCT-TRUTH.md` فیلتر شود. جدول زیر Cluster→Product-Truth mapping را خلاصه می‌کند؛ **این جدول ادعای جدیدی اضافه نمی‌کند**، فقط ارجاع می‌دهد:

| موضوع کلمهٔ کلیدی | وضعیت | مرجع |
|---|---|---|
| درگاه پرداخت آنلاین (پرداخت آنلاین مطب/کلینیک) | **REJECTED / NOT ALLOWED** | `PRODUCT-TRUTH §4` |
| اتصال به نسخهٔ الکترونیک ملی ایران / سامانهٔ پروندهٔ سلامت ملی | **REJECTED / NOT ALLOWED** | `PRODUCT-TRUTH §3 #11`, §4 |
| حسابداری کامل / دفتر کل / اظهارنامهٔ مالیاتی | **REJECTED / NOT ALLOWED** | `PRODUCT-TRUTH §4` |
| اتصال بیمه (Insurance Integration) | **REJECTED / NOT ALLOWED** | `PRODUCT-TRUTH §4` |
| اپلیکیشن موبایل (Mobile App) / اپ پزشک-بیمار | **REJECTED / NOT ALLOWED** | `PRODUCT-TRUTH §4` |
| ادعاهای AI-Powered برای محصول | **REJECTED / NOT ALLOWED** | `PRODUCT-TRUTH §4` |
| گواهی امنیتی / انطباق قانونی / Compliance | **REJECTED / NOT ALLOWED** | `PRODUCT-TRUTH §4` |
| تضمین Uptime/SLA/پشتیبانی ۲۴/۷ | **REJECTED / NOT ALLOWED** | `PRODUCT-TRUTH §4` |
| قیمت/بستهٔ عمومی (Public Pricing/Packages) | **DEFERRED — OPEN BUSINESS DECISION** (نه Reject قطعی، بلکه معلق تا تصمیم Pricing) | `ROADMAP §9/§21`؛ `SITE-ARCHITECTURE §4.3` ردیف Pricing |
| نوبت‌دهی، پذیرش/صف، پرونده، چندکلینیکی، مالی (Clusterهای ۲–۶) | **DEFERRED — REQUIRES PRODUCT VERIFICATION تا REVERIFY BEFORE PUBLIC LAUNCH** | `PRODUCT-TRUTH §3` (#۱–#۱۲) |
| «نرم افزار رایگان» / Free Software Intent | **FORBIDDEN — تعارض با Positioning تجاری** (بخش زیر) | — |

### E.1 ممنوعیت صریح Intent «نرم‌افزار رایگان»

هدف‌گیری عبارات با Intent «نرم افزار رایگان»، «نرم افزار مدیریت کلینیک رایگان»، «دانلود رایگان نرم افزار مطب» یا هر معادل آن **ممنوع** است، زیرا:

- سایت مدل فروش **Assisted Sale** دارد و قیمت‌گذاری/تجاری‌سازی بر پایهٔ گفت‌وگوی فروش است، نه توزیع رایگان (`ROADMAP §8/§9`؛ `SITE-ARCHITECTURE §1.2`)؛
- ترافیک با Intent «رایگان» با معیار موفقیت سایت (Lead واجد شرایط، نه ترافیک خام — `ROADMAP §15`) در تعارض مستقیم است؛
- جذب این ترافیک منجر به نرخ تبدیل نزدیک صفر و رقیق‌شدن سیگنال کیفیت محتوا نزد Google می‌شود.

هیچ صفحه، Meta Description، FAQ یا Blog Post آینده نباید برای این Intent نوشته یا بهینه شود.

---

## F. برنامهٔ اجرای اخلاقی و یادگیری سریع (Fast-Learning Ethical Execution Plan)

هدف این بخش، حداکثرسازی دیده‌شدن اولیه **صرفاً از طریق کیفیت و صداقت محتوا** است، نه تاکتیک‌های کوتاه‌مدت پرریسک.

### F.1 پیش از انتشار عمومی (Pre-Launch)

1. **صفحات عمیق و شواهدمحور برای Clusterهای پرارزش:** برای هر Cluster فعال (۱، ۲، ۵ در اولویت اول طبق `SITE-ARCHITECTURE §14`)، صفحه‌ای عمیق، مبتنی بر Screenshot واقعی (`SITE-ARCHITECTURE §11` Media Contract) و بدون ادعای بدون سند ساخته شود؛ صفحهٔ صرفاً تبلیغاتی بدون شواهد منتشر نمی‌شود (`ROADMAP §5.2`).
2. **تایپوگرافی فارسی معنایی و سلسله‌مراتب Heading صحیح:** یک H1 در هر صفحه، سلسله‌مراتب H2/H3 منطقی، نیم‌فاصلهٔ صحیح، اعداد فارسی در متن روایی (`SITE-ARCHITECTURE §9`)؛ کیفیت خواندن فارسی مستقیماً بر Helpful Content Signal اثر دارد.
3. **لینک‌سازی داخلی ساختاریافته:** هر صفحهٔ جدید باید حداقل یک مسیر ورودی (از Hub/Blog/Home) و حداقل یک مسیر خروجی به CTA یا صفحهٔ مرتبط داشته باشد؛ بدون Orphan Page (`SITE-ARCHITECTURE §5.3`).
4. **آمادگی فنی خزش/ایندکس:** Canonical یکتا، Sitemap ساختاریافته (فعال‌سازی واقعی فقط در Publication Gate — `SITE-ARCHITECTURE §19.1`)، بدون Soft-404، بدون سرریز افقی موبایل (`§19.2`).
5. **Registry شواهد/رسانه:** هر Screenshot/ادعا به یک ردیف تأییدشدهٔ `PRODUCT-TRUTH` نگاشت شود؛ بدون Asset ساختگی (`SITE-ARCHITECTURE §11.3/§11.10`).

### F.2 پس از انتشار عمومی (Post-Launch)

1. **پایش شواهد واقعی، نه حدس:** پس از عبور از Publication Gate، شواهد واقعی Search Console/Field Data بررسی و یافته‌های قابل‌اقدام Triage می‌شوند؛ رفتارهای غیرقابل‌اقدام Google به‌عنوان `GOOGLE BEHAVIOR — NOT A SITE DEFECT` مستند می‌شوند، نه به‌عنوان شکست پروژه (`SITE-ARCHITECTURE §19.3`).
2. **گسترش تدریجی Cluster ۷ (در صورت فعال‌سازی سرویس مکمل):** فقط پس از تأیید صریح مالک و تعریف سرویس؛ گسترش با محتوای واقعی و متفاوت، نه تکثیر صفحه بر اساس شهر/تخصص.
3. **به‌روزرسانی Cluster بر اساس شواهد واقعی رفتار کاربر و محصول:** با تغییر واقعی محصول (مثلاً بسته‌شدن فاز Reception در `PRODUCT-TRUTH §3 #9`) یا شواهد جدید تقاضا، این سند به‌روزرسانی می‌شود (بخش تغییرات پایین).

### F.3 عدم‌تحمل مطلق نسبت به تاکتیک‌های ممنوع (Zero Tolerance)

بدون استثناء، هیچ‌یک از موارد زیر در هیچ Cluster یا صفحه‌ای مجاز نیست:

- **Keyword Stuffing** (انباشت مکانیکی عبارت کلیدی در متن/Alt/Meta)؛
- **متن پنهان یا رنگ هم‌رنگ پس‌زمینه**؛
- **لینک خریداری‌شده یا شبکهٔ لینک مصنوعی (PBN)**؛
- **محتوای Cloaked یا نمایش متفاوت به کاربر/ربات**؛
- **بازبینی/کپی محتوای رقبا بدون ارزش افزودهٔ واقعی**؛
- **صفحات Doorway شهر/تخصص برای هیچ‌یک از دو مسیر تجاری** (بخش B.2، Cluster ۷).

نقض هر مورد بالا، صرف‌نظر از فایدهٔ کوتاه‌مدت احتمالی در رتبه، **رد** می‌شود؛ این یک اصل معماری، نه یک ترجیح سبک محتوا است.

---

## G. وضعیت این Slice و شواهد (Evidence)

| فیلد | مقدار |
|---|---|
| Repo root | `bia2on2on/Site-p-doctor-` (این checkout) |
| Base/live main در زمان نوشتن | `c410d4640ca1dc97dc1155ee8b46c81ca5c49e21` (merge PR #3) |
| Open PRs پیش از شروع | هیچ |
| Working tree پیش از شروع | clean، بدون untracked |
| اسناد خوانده‌شده در revision زنده | `AGENTS.md`, `docs/ROADMAP.md`, `docs/PRODUCT-TRUTH.md`, `docs/AGENT-TOOLING.md`, `docs/SITE-ARCHITECTURE.md` |
| نوع Slice | مستنداتی محض — بدون کد، Theme، Plugin، Elementor Template، WordPress Config یا نصب ابزار |
| حجم جست‌وجو/CPC/رقابت | هیچ عددی ابداع **نشد**؛ همه‌جا `VOLUME NOT RETRIEVED` |
| ادعای رتبه/تضمین ایندکس | هیچ‌کدام داده **نشد** (بخش B.4) |
| ادعای قابلیت محصول جدید | هیچ ادعای جدیدی بیان **نشد**؛ همهٔ ارجاعات capability به `PRODUCT-TRUTH §2/#3` با همان سقف `REVERIFY BEFORE PUBLIC LAUNCH` یا `NOT ALLOWED` |
| ارتباط با D-01 | این سند هم‌زمان با رفع D-01 در `docs/SITE-ARCHITECTURE.md` §0.2 (افزودن برچسب `CONDITIONAL ON BUSINESS READINESS + SERVICE DEFINITION`) در همین PR تحویل شد؛ محتوای Cluster 7 و بخش D از همان برچسب استفاده می‌کنند |
| NOT RUN | هر ابزار Keyword Research واقعی، Search Console، Playwright/Browser، اندازه‌گیری CWV — به‌دلیل نوع Slice مستنداتی و عدم مجوز نصب ابزار در این فاز |

**Change log**

| تاریخ (UTC) | محرک | خلاصه |
|---|---|---|
| 2026-09-27 | دستور «ایجاد نقشهٔ کلمات کلیدی SEO + رفع D-01» (Write Agent #4) | اولین نسخه: بخش A (دو مسیر تجاری)، B (خط پایهٔ کیفیت Google)، C (۸ Cluster، همه با `VOLUME NOT RETRIEVED`)، D (نقشهٔ مالکیت صفحه-به-Query)، E (مرزبندی Product-Truth + ممنوعیت نرم‌افزار رایگان)، F (برنامهٔ اجرای اخلاقی pre/post-launch)، G (شواهد) — بدون کد/Plugin/Theme/ابزار، بدون عدد ابداعی، بدون تضمین رتبه |
