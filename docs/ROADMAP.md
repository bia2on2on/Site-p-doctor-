# نقشه راه معماری سایت معرفی و فروش CPMS

**وضعیت سند:** پیشنهادی برای تأیید معماری و برنامه‌ریزی، نه مشخصات اجرایی نهایی

**دامنه:** وب‌سایت رسمی Product Marketing و Sales برای Clinic Practice Management System (CPMS)

**تاریخ ممیزی اولیه:** 2026-09-27 (UTC)

**آخرین به‌روزرسانی سند:** 2026-09-27 (UTC) — ثبت تصمیم‌های Discovery مالک محصول، Product Truth Gate، قواعد مرجع تصمیم‌گیری و ارجاع به راهنمای عملیاتی Agentها؛ سپس ثبت تصمیم توسعه موازی سایت/محصول، تفکیک دروازه‌های Implementation و Publication، سیاست «عدم انتشار عمومی و عدم Index شدن عمدی پیش از آمادگی محصول»، ارجاع به مرجع زنده Product Truth (`docs/PRODUCT-TRUTH.md`) و اصلاح F-01 در بخش ۲۳

---

## 1. هدف و نحوه استفاده از این سند

این سند مرجع اولیه معماری، تجربه کاربری، محتوا، SEO، عملکرد و برنامه اجرای سایت رسمی CPMS است. هدف آن مشخص کردن این موارد است:

- چه چیزی باید ساخته شود و چرا؛
- ترتیب و خروجی هر Slice چیست؛
- هر صفحه چه نقشی در مسیر آگاهی تا تبدیل دارد؛
- معیار پذیرش هر مرحله چیست؛
- کدام موضوعات هنوز تصمیم محصول، فروش، محتوا یا حقوقی می‌خواهند؛
- چه چیزهایی عمداً خارج از Scope فعلی هستند.

این سند **محتوای نهایی سایت، طراحی نهایی UI، انتخاب افزونه، کدنویسی یا پیکربندی WordPress/Elementor نیست**. قبل از اجرای هر فاز، واقعیت محصول و تصمیم‌های باز باید بررسی و در صورت نیاز نسخه این سند به‌روزرسانی شود.

**راهنمای عملیاتی Agentها:** قواعد کوتاه و پایدار مربوط به نقش Agentها، حدود اختیار، انضباط Repository/Git، Marketing Truth، دروازه شروع Implementation و بازنشستگی Writer در فایل ریشه `AGENTS.md` نگهداری می‌شود. هر Agent باید پیش از شروع کار آن فایل را بخواند؛ این سند همچنان مرجع جزئیات برنامه‌ریزی است.

### اصل راهنما: واقعیت محصول مقدم است

هیچ قابلیت، Integration، آمار، مشتری، قیمت، سطح امنیت، نظر مشتری یا مزیت مطلقی بدون مدرک معتبر نباید در سایت به‌عنوان واقعیت درج شود. تا زمانی که مستندات رسمی، محیط قابل مشاهده یا تأیید مالک محصول در دسترس نباشد، یک مورد در این سند فقط به‌عنوان **Unknown، پیشنهاد معماری یا سؤال باز** شناخته می‌شود؛ نه قابلیت CPMS.

**جهت Positioning مورد نظر (DECIDED):** CPMS باید به‌عنوان یک **محصول یکپارچه مدیریت حرفه‌ای کلینیک** فهمیده شود، نه صرفاً یک «سیستم نوبت‌دهی». پیام محوری:

> مدیریت حرفه‌ای کلینیک، ساده و یکپارچه

**REQUIRES PRODUCT VERIFICATION:** این جهت، مجوز ادعای قابلیت نیست. هیچ قابلیت یا جریان کاری (نوبت‌دهی، پذیرش، ویزیت، نسخه، مالی، چندکلینیکی و مانند آن) پیش از تأیید واقعیت محصول نباید به‌عنوان موجود در متن عمومی بیان شود. اعتبارسنجی ادعاها در Product Truth Gate (بخش ۳) انجام می‌شود.

### وضعیت‌های تصمیم در این سند

هر موضوع کلیدی باید یکی از این چهار وضعیت را داشته باشد؛ هیچ Unknown نباید به‌عنوان حل‌شده نمایش داده شود:

- **DECIDED:** تصمیم کسب‌وکار/مالک محصول گرفته شده و مبنای برنامه‌ریزی است؛
- **REQUIRES PRODUCT VERIFICATION:** جهت مشخص است، اما ادعای عمومی به تأیید واقعیت محصول نیاز دارد؛
- **OPEN BUSINESS DECISION:** تصمیم تجاری حل‌نشده که باید با مالک محصول یا شواهد روشن شود؛
- **DEFERRED UNTIL IMPLEMENTATION/ENVIRONMENT:** تصمیم وابسته به محیط، ابزار یا Baseline اجرایی که فعلاً وجود ندارد.

---

## 2. وضعیت واقعی Repository در زمان ممیزی

### موارد مشاهده‌شده

- Repository: `bia2on2on/Site-p-doctor-`
- Branch کاری: `arena/01a0e420-site-p-doctor`
- HEAD و Base commit ممیزی: `99c5135b8c36614d23533dfff37516691587815f`
- وضعیت Worktree هنگام ممیزی: پاک؛ تغییر محلی ثبت‌نشده وجود نداشت.
- تاریخچه قابل مشاهده: یک Commit اولیه با عنوان `Initial commit`
- فایل tracked موجود پیش از این سند: `README.md`
- محتوای README فقط هدف کلی «طراحی سایت معرفی و فروش پلاگین cpms» را بیان می‌کند.
- Remote `origin` به مخزن GitHub پروژه متصل است.

### مواردی که از Repository قابل تأیید نیستند

در Checkout بررسی‌شده هیچ baseline اجرایی برای موارد زیر وجود ندارد؛ وضعیت محیط Deploy یا محیط محلی خارج از فایل‌های Repository **Unknown** است:

- نصب WordPress، Theme یا Child Theme؛
- نصب یا پیکربندی Elementor؛
- Pluginهای فرم، SEO، Cache، امنیت، Analytics یا فروش؛
- Templateهای Elementor و Global Settings؛
- فهرست واقعی قابلیت‌های CPMS و نسخه محصول؛
- Screenshot، Video، Asset برند یا محتوای تأییدشده محصول؛
- مدل فروش، قیمت‌گذاری، صورتحساب یا Refund؛
- endpoint یا مقصد Leadها و فرآیند Sales؛
- Hosting، PHP/WordPress compatibility، Cache، CDN و محیط Staging/Production؛
- داده مشتری، Testimonial، Logo، آمار استفاده یا شواهد Trust؛
- اسناد حقوقی، سیاست حفظ حریم خصوصی و الزامات داده؛
- Analytics، Search Console، Sitemap یا وضعیت Index شدن.

بنابراین این نقشه راه **هیچ‌یک از موارد بالا را به‌عنوان موجود فرض نمی‌کند**. Phase 0 باید پیش از هر اجرای سایت، این Unknownها را به یافته و تصمیم تبدیل کند.

---

## 3. Product و Positioning Foundation

### هدف محصول سایت

سایت باید یک تجربه حرفه‌ای برای معرفی، آموزش، ارزیابی و تبدیل مخاطب به Lead فراهم کند و CPMS را به‌عنوان یک **Clinic Practice Management System** توضیح دهد. ارزش پیشنهادی باید از جریان کاری کلینیک شروع شود، نه از فهرست بلند امکانات یا ادعای رقابتی بدون سند.

**هدف تجاری اصلی سایت (DECIDED):** کار اصلی تجاری سایت این است که تصمیم‌گیرنده مناسب در کلینیک/مرکز درمانی درک کند CPMS برای **مدیریت حرفه‌ای کلینیک** طراحی شده است و او را به‌سمت **درخواست دمو/مشاوره** حرکت دهد. ترافیک به‌تنهایی موفقیت نیست؛ موفقیت با Lead واجد شرایط و پیشرفت آن در مسیر فروش سنجیده می‌شود (بخش ۱۵ و Product Truth Gate در همین بخش).

### Workflow مرجع برای تحقیق و معماری

در صورت تأیید شدن در Product Discovery، مسیر زیر ستون فقرات Information Architecture و پیام‌رسانی خواهد بود:

`Patient → Appointment → Reception → Waiting → Doctor Visit → Treatment → Prescription → Payment → Record`

این زنجیره در Roadmap به‌عنوان **مدل تحقیق و روایت محصول** آمده است، نه فهرست قابلیت‌های قطعی. هر گام باید با رفتار واقعی CPMS تطبیق داده شود و گام‌های پیاده‌نشده نباید در فروش تبلیغ شوند.

### مخاطب هدف (DECIDED)

- **مخاطب اصلی در فاز اول:** کلینیک‌های چندپزشکی و مراکز درمانی که پزشک، منشی/پذیرش و چند جریان کاری عملیاتی دارند؛
- **مخاطب ثانویه:** پزشکان و مطب‌های مستقل/کوچک.

این تقسیم‌بندی یک **جهت بازاریابی** است، نه ادعای تناسب محصول. تناسب با هر بخش فقط پس از تأیید قابلیت محصول قابل بیان است؛ تا آن زمان محتوای مرتبط باید محتاطانه، مشروط یا در حد توضیح جریان کاری تأییدشده بماند.

### Personas هدف

1. **مدیر یا صاحب کلینیک:** دید عملیاتی، مدیریت پزشکان/بیماران/نوبت‌ها، پذیرش، ویزیت، نسخه و امور مالی فقط در حدودی که در محصول واقعی وجود دارد.
2. **پزشک دارای مطب:** برنامه کاری، نوبت، فرآیند ویزیت، پرونده و نسخه، مشروط به تأیید محصول.
3. **کلینیک چندپزشکی:** چند پزشک، پذیرش، صف/انتظار و تفکیک مسئولیت‌ها، مشروط به شواهد محصول.
4. **مرکز درمانی در حال رشد:** ساختار قابل توسعه، چند موقعیت یا چند کلینیک، مشروط به تأیید معماری CPMS.

سایت نباید پیشاپیش فقط برای «یک پزشک و یک مطب» طراحی شود؛ هم‌زمان نباید پشتیبانی از مراکز بزرگ‌تر را بدون تأیید محصول ادعا کند.

### خروجی مورد انتظار Discovery

- Product Truth Inventory / Fact Sheet با وضعیت هر قابلیت بر اساس دسته‌های Product Truth Gate: `AVAILABLE NOW` / `COMING / ROADMAP` / `CUSTOM / CONTACT SALES` / `NOT CURRENTLY AVAILABLE`، همراه با رکورد شواهد؛
- Value Proposition و Messaging hierarchy تأییدشده؛
- Persona و Job-to-be-done؛
- واژگان مجاز و غیرمجاز تبلیغاتی؛
- شواهد قابل انتشار برای Trust؛
- فهرست ادعاهایی که نیازمند مدرک، توضیح محدودیت یا حذف هستند.

### تم‌های بازاریابی مورد نظر مالک — نیازمند تأیید محصول (REQUIRES PRODUCT VERIFICATION)

مالک محصول این محورها را از نظر استراتژیک مهم می‌داند و انتظار دارد در روایت بازاریابی سایت دیده شوند:

- جریان‌های کاری یکپارچه کلینیک از نوبت تا پذیرش/ویزیت و فرآیندهای مالی؛
- معماری چندکلینیکی و مدیریت نقش‌ها/دسترسی‌ها؛
- امنیت، تفکیک اطلاعات و کنترل دسترسی به داده پزشکی.

**این‌ها «تم بازاریابی مورد نظر مالک» هستند، نه «ادعای قابلیت منتشرشده».** تا زمانی که شواهد محصول بررسی نشده باشد:

- هیچ‌یک از این محورها نباید در متن عمومی به‌عنوان قابلیت موجود یا قطعی بیان شود؛
- این موارد به‌طور خاص نیازمند تأیید صریح هستند: فرآیندهای مالی، دریافت/تسویه پرداخت، رفتار چندکلینیکی، رفتار نقش/دسترسی، تفکیک اطلاعات، پیاده‌سازی امنیت و هر جریان کاری مشخص دیگر؛
- قصد مالک محصول هرگز نباید به شواهد محصولِ منتشرشده تبدیل شود.

### Product Truth Gate — دروازه تأیید پیش از متن عمومی

پیش از تأیید هر متن بازاریابی نهایی (صفحات عمومی، تبلیغات، CTAها و توضیح قابلیت‌ها) باید یک **فهرست تأییدشده قابلیت‌ها (Product Truth Inventory)** وجود داشته باشد که وضعیت هر قابلیت را در یکی از این چهار دسته مشخص کند:

- **AVAILABLE NOW**
- **COMING / ROADMAP**
- **CUSTOM / CONTACT SALES**
- **NOT CURRENTLY AVAILABLE**

قواعد گیت:

- فقط شواهد تأییدشده می‌تواند یک قابلیت را در دسته **AVAILABLE NOW** قرار دهد؛
- قابلیت‌های در حال توسعه یا در Roadmap محصول نباید به‌عنوان موجود معرفی شوند؛
- تا زمان وجود این فهرست، هر متن مرتبط باید محدود، مشروط یا «نیازمند تأیید» بماند؛
- این گیت یک **الزام برنامه‌ریزی برای آینده** است؛ خود فهرست در این Slice ساخته یا تکمیل نمی‌شود و بدون بررسی شواهد واقعی محصول، تکمیل‌شده علامت نمی‌خورد.

برای هر ادعای عمومی مهم، رکورد شواهد آینده باید حداقل شامل این موارد باشد:

| فیلد | توضیح |
|---|---|
| Capability / Workflow | قابلیت یا جریان کاری مورد ادعا |
| Current status | یکی از چهار وضعیت `AVAILABLE NOW` / `COMING / ROADMAP` / `CUSTOM / CONTACT SALES` / `NOT CURRENTLY AVAILABLE` |
| Evidence / Source | منبع تأییدکننده: مستندات محصول، محیط قابل مشاهده یا تأیید مالک محصول |
| Permitted wording / Limitation | جمله مجاز بازاریابی یا محدودیت/شرط بیان آن |

### توسعه موازی سایت و محصول و دروازه‌های مجزای Implementation/Publication (DECIDED)

تصمیم مالک محصول: **وب‌سایت و پلاگین CPMS به‌صورت موازی توسعه می‌یابند.**

**Target Presentation State (وضعیت نمایش هدف):** سایت باید به‌عنوان **وب‌سایت نهایی Marketing/Sales برای یک محصول CPMS کامل و آماده ارائه** معماری، طراحی و در نهایت پیاده‌سازی شود؛ **نه** به‌عنوان سایت Early-Access، Beta، Coming-Soon، اختصاصی برای مشتریان خاص یا Landing Page موقتی پیش‌از-انتشار.

**Current Product Truth (واقعیت فعلی محصول):** در طول توسعه موازی، برخی از قابلیت‌های هدف ممکن است هنوز ناتمام یا بدون تأیید باشند. طراحی فضا/معماری محتوا برای یک قابلیت کامل آینده، **مجوز انتشار آن قابلیت به‌عنوان در دسترس فعلی پیش از تأیید نیست**. این دو مفهوم (نمایش هدف و واقعیت فعلی) نباید با هم اشتباه گرفته شوند.

**سیاست انتشار تا آمادگی محصول (DECIDED):**

- سایت فقط در محیط Development/Staging باقی می‌ماند؛
- نباید عمداً به‌طور عمومی منتشر (Public Launch) شود؛
- نباید عمداً توسط موتورهای جست‌وجو Index شود؛
- نباید به‌عنوان محصولی در دسترس عمومی بازاریابی شود؛
- ادعاهای ناتمام/تأییدنشده نباید به محیط عمومی نشت کنند.

جزئیات پیاده‌سازی فنی (مانند Noindex یا احراز هویت) در این مرحله تعیین **نمی‌شود**؛ فقط الزام «عدم انتشار عمدی و عدم Index شدن عمدی» ثبت می‌شود و جزئیات پیاده‌سازی به فاز Environment/Deployment واگذار است (DEFERRED UNTIL IMPLEMENTATION/ENVIRONMENT).

**دو دروازه مجزا — Implementation و Publication:**

- **Implementation Gate:** تکمیل و پذیرش دروازه‌های برنامه‌ریزی/طراحی/فنی سایت (شرایط شروع Implementation، بخش ۱۷) می‌تواند آغاز پیاده‌سازی سایت را مجاز کند، حتی در حالی که توسعه محصول ادامه دارد؛ **انتظار کامل‌شدن کل پلاگین پیش‌نیاز نیست.**
- **Publication Gate:** انتشار عمومی سایت مستلزم **آمادگی Launch محصول** و **بازتأیید نهایی Product Truth** بر مبنای نسخه Launch (Launch Truth Gate در `docs/PRODUCT-TRUTH.md`) است.
- این دو دروازه **مجزا** هستند: عبور از Implementation Gate مجوز Publication نمی‌دهد و کامل‌شدن خود سایت به‌تنهایی مجوز انتشار عمومی نیست. **هیچ‌یک از این دو دروازه با این به‌روزرسانی Passed نشده است.**
- سایت می‌تواند در حالی ساخته شود که CPMS هنوز در حال تکمیل است؛ اما نمی‌تواند فقط به‌خاطر کامل‌شدن خودِ سایت به‌طور عمومی منتشر شود.

**مرجع زنده Product Truth:** سند زنده مدیریت ادعاهای سایت (Claim-Control) در `docs/PRODUCT-TRUTH.md` نگهداری می‌شود: شواهد فعلی تأییدشده، نمایش هدف Launch، مجوز انتشار، فهرست ممنوعه، قواعد Placeholder و Launch Truth Gate. این سند جای Product Truth Gate را نمی‌گیرد؛ قواعد هر دو با هم اعمال می‌شوند.

**جهت تجاری (تأیید مجدد، بدون تغییر):** «آماده ارائه» بودن محصول به‌معنای E-commerce، Signup آنی، Checkout عمومی، قیمت عمومی/ثابت یا Self-Service SaaS **نیست**؛ این‌ها تصمیم‌های تجاری جداگانه و مستقل هستند. Conversion اصلی سایت همچنان **درخواست دمو/مشاوره** است، مگر با تصمیم بعدی تغییر کند.

---

## 4. Scope سایت و Information Architecture

### 4.1 صفحات اصلی پیشنهادی

صفحات زیر در معماری اولیه پیش‌بینی می‌شوند. وجود نهایی هر صفحه، نام فارسی، Slug و اولویت آن در Phase 2 تأیید می‌شود:

| بخش | مسیر پیشنهادی | هدف اصلی |
|---|---|---|
| خانه | `/` | معرفی ارزش، ایجاد اعتماد و هدایت به Demo |
| امکانات | `/features/` | توضیح دسته‌های قابلیت و شواهد محصول |
| راهکارها | `/solutions/` | تطبیق CPMS با سناریوهای استفاده |
| قیمت | `/pricing/` | توضیح مدل فروش؛ بدون قیمت فرضی |
| درخواست دمو | `/demo/` | تبدیل بازدیدکننده واجد شرایط به Lead |
| درباره | `/about/` | اطلاعات واقعی شرکت/محصول و اعتماد |
| پرسش‌های متداول | `/faq/` | رفع ابهام پیش از اقدام |
| وبلاگ | `/blog/` | آموزش، کشف محصول و Organic Lead |
| پشتیبانی | `/support/` | مسیر مستندات یا تماس پشتیبانی؛ وابسته به مدل واقعی |
| تماس | `/contact/` | ارتباط عمومی و Sales |
| جست‌وجو | `/search/` | جست‌وجوی Blog، Feature، Solution و محتوا |
| قوانین | `/legal/` | درگاه صفحات حقوقی |
| حریم خصوصی | `/privacy-policy/` | متن واقعی و تأییدشده |
| شرایط/Refund | `/terms/` و `/refund-policy/` | متن واقعی و تأییدشده |
| 404 | سیستم | بازیابی مسیر و هدایت به صفحات اصلی |

Slugهای انگلیسی بالا فقط نمونه معماری هستند و نباید بدون بررسی Search Intent، عرف فارسی و تصمیم SEO نهایی شوند.

### 4.2 سلسله‌مراتب Navigation

Header پیشنهادی:

- امکانات؛
- راهکارها؛
- قیمت؛
- دمو؛
- وبلاگ؛
- پشتیبانی؛
- CTA اصلی: **درخواست دموی CPMS**.

Footer باید لینک‌های معرفی CPMS، امکانات، راهکارها، منابع، پشتیبانی، تماس، قوانین، Privacy و شبکه‌های اجتماعی واقعی (در صورت وجود) را به‌صورت کوتاه و قابل اسکن ارائه کند. Footer نباید به مخزن لینک‌های بی‌هدف تبدیل شود.

### 4.3 مدل لینک‌سازی داخلی

- Home به Feature، Solution، Pricing و Demo لینک می‌دهد.
- هر Feature به Workflow مرتبط، Solution مرتبط، FAQ و CTA قابل‌انتساب لینک می‌دهد.
- هر Solution به قابلیت‌های مرتبط و Demo اختصاصی خود لینک می‌دهد.
- Blog از مقالات آموزشی به صفحات Cornerstone، Feature و Solution لینک می‌دهد.
- Breadcrumb در صفحات عمیق مسیر برگشت را نشان می‌دهد.
- هیچ صفحه‌ای نباید فقط با منوی اصلی قابل دسترسی باشد؛ Orphan Pageها در QA شناسایی می‌شوند.

---

## 5. معماری Features

### 5.1 Taxonomy پیشنهادی

دسته‌های زیر پایه طراحی Information Architecture هستند و تا زمان ممیزی محصول، **پیشنهاد دسته‌بندی** محسوب می‌شوند:

- **Clinic Management:** ساختار و عملیات کلینیک؛
- **Patients:** اطلاعات بیمار و پرونده در محدوده واقعی محصول؛
- **Appointments:** نوبت‌ها، تقویم و برنامه‌ریزی در صورت وجود؛
- **Doctors:** پزشکان و برنامه کاری در صورت وجود؛
- **Reception:** پذیرش، حضور، صف و انتظار در صورت وجود؛
- **Visits & Prescriptions:** ویزیت، درمان و نسخه در صورت وجود؛
- **Finance:** هزینه‌ها و دریافت‌ها فقط در محدوده واقعی محصول.

هر دسته باید پس از Product Fact Check به یکی از این حالات برسد: قابل انتشار، قابل انتشار با محدودیت، نیازمند بررسی بیشتر، یا حذف از معماری عمومی.

### 5.2 الگوی Feature Landing Page

هر قابلیت اصلی که شواهد واقعی و ارزش مستقل دارد، باید امکان تبدیل شدن به صفحه مستقل داشته باشد:

1. Hero با Value Proposition دقیق و غیرمطلق؛
2. Problem واقعی و قابل فهم برای Persona؛
3. Solution و توضیح کارکرد محصول؛
4. Screenshot واقعی با Context و Caption؛
5. Workflow مرتبط؛
6. Key Benefits که به قابلیت واقعی متصل است؛
7. توضیح جزئیات، محدودیت‌ها و شرایط استفاده؛
8. UI واقعی یا Video در صورت وجود؛
9. FAQ همان قابلیت؛
10. CTA متناسب، معمولاً درخواست Demo.

هر صفحه باید مسیر زیر را کامل کند:

`Problem → Solution → Evidence → Benefit → CTA`

صفحه‌ای که فقط از جمله‌های تبلیغاتی تشکیل شده و Evidence ندارد، تا زمان تأمین شواهد نباید به‌عنوان صفحه محصول نهایی منتشر شود.

---

## 6. معماری Solutions

Solutions بر اساس سناریوی استفاده سازمان‌دهی می‌شود، نه تکرار Featureها:

- مطب پزشک؛
- کلینیک چندپزشکی؛
- کلینیک چندموقعیتی؛
- مرکز درمانی در حال رشد.

هر Solution Page باید شامل این اجزا باشد:

- مسئله و وضعیت فعلی Persona؛
- Workflow سناریو؛
- قابلیت‌های مرتبط و فقط قابلیت‌های تأییدشده؛
- Screenshot یا Evidence واقعی؛
- محدودیت‌ها و پیش‌نیازها در صورت نیاز؛
- FAQ اختصاصی؛
- CTA متناسب با Journey.

پشتیبانی CPMS از چند پزشک، چند موقعیت یا هر سطح سازمانی باید در Discovery اثبات شود. عنوان صفحه به‌تنهایی مجوز ادعای آن قابلیت نیست.

---

## 7. معماری Homepage و Conversion

Homepage یکی از صفحات اصلی Conversion است و باید با هدفی روشن طراحی شود؛ هدف اصلی پیشنهادی **درخواست دموی CPMS** است.

**ترتیب روایت مورد نظر (DECIDED):**

> مسئله واقعی و قابل تشخیص کلینیک → معرفی سریع CPMS به‌عنوان راه‌حل → نمایش زودهنگام محصول واقعی → توضیح اتصال جریان‌های کاری تأییدشده → رفع ابهام‌های اعتماد/تناسب → دعوت به دمو/مشاوره

پیام مورد نظر این است: «ما این محیط کاری را می‌شناسیم؛ این محصول واقعی برای آن طراحی شده است؛ ببینید چگونه کار می‌کند.» روایت «کلینیک شما خراب است و ما آن را نجات می‌دهیم» ممنوع است.

**Problem Framing (DECIDED):** چارچوب‌بندی مسئله باید کوتاه و واقعی باشد، از ترس‌فروشی/اغراق/مقصرسازی پرهیز کند و فقط مسائلی را مطرح کند که بعداً می‌توان برای آن‌ها راه‌حل محصولی قابل نمایش ارائه کرد؛ مسئله‌ها باید با تحقیق Persona تأیید شوند.

ساختار پیشنهادی Homepage:

1. **Hero:** Value Proposition کوتاه و روشن، CTA اصلی «درخواست دموی CPMS»، CTAهای ثانویه «مشاهده امکانات» و «مشاهده قیمت».
2. **Problem:** مسئله واقعی، کوتاه و بر اساس قواعد Problem Framing بالا.
3. **CPMS Solution:** معرفی سریع و روشن CPMS به‌عنوان محصول یکپارچه مدیریت کلینیک.
4. **Real Product UI (زودهنگام):** نمایش محصول واقعی در همان ابتدای صفحه؛ تصویر باید هم «تفکر یکپارچه جریان کار» و هم «کاربردپذیری منظم و قابل فهم» را منتقل کند و تأکید اصلی بر یکپارچگی است. Screenshot/Video واقعی در صورت وجود؛ UI جعلی که ممکن است با قابلیت واقعی اشتباه شود ممنوع است (بخش ۱۶).
5. **Workflow:** نمایش جریان `Patient → Appointment → Reception → Waiting → Visit → Prescription → Payment → Record` فقط تا حدی که با محصول تأیید شده باشد.
6. **Feature Categories:** نمایش دسته‌های قابل‌تأیید، نه Grid پر از ادعا.
7. **Solutions:** مسیرهای استفاده برای Personaها و اندازه‌های مختلف مرکز.
8. **Product Video:** ویدیوی کوتاه Product-focused، بدون Autoplay سنگین و Background Video غیرضروری.
9. **Trust:** ابتدا پاسخ به «آیا این با نحوه کار یک کلینیک واقعی تناسب دارد؟»، سپس امنیت/دسترسی به داده و در ادامه Onboarding/آموزش/پشتیبانی (سلسله‌مراتب بخش ۱۶).
10. **Pricing Preview:** خلاصه مسیر فروش و دعوت به دریافت پیشنهاد، بدون ساختن Plan، Price، Limit یا Discount.
11. **FAQ:** سؤال‌های واقعی که مانع تصمیم هستند.
12. **Final CTA:** CTA کوتاه و واضح با مقصد قابل‌اندازه‌گیری.

CTAها باید با مرحله Journey متناسب باشند؛ تکرار بی‌هدف یک CTA در تمام بخش‌ها پذیرفته نیست.

---

## 8. Demo، Lead Generation و Contact

**مدل Conversion (DECIDED):** مسیر اولیه یک **فروش همراهی‌شده (Assisted Sale)** است؛ CTA اصلی «درخواست دمو/مشاوره» است و سایت در فاز اول به‌عنوان فروشگاه آنلاین عمل نمی‌کند. Checkout، پرداخت آنلاین یا خرید مستقیم نه پیاده‌سازی می‌شود و نه فرض می‌شود.

صفحه Demo از مهم‌ترین صفحات Conversion است. فهرست زیر یک فرم پیشنهادی است، نه تصمیم نهایی Sales:

- نام؛
- موبایل؛
- نام کلینیک؛
- نوع مرکز؛
- تعداد پزشکان؛
- تعداد موقعیت‌ها؛
- شهر؛
- توضیحات؛
- زمان مناسب برای تماس.

قبل از پیاده‌سازی باید این موارد مشخص شوند: فیلدهای لازم، مبنای رضایت، مقصد داده، مالک پیگیری، SLA تماس، نگهداری/حذف داده و پیام‌های واقعی موفقیت یا خطا.

### معیارهای فنی فرم

- Validation سمت سرور؛
- Sanitization و Escaping؛
- Nonce؛
- Spam Protection متناسب با Privacy؛
- Rate Limit؛
- عدم جمع‌آوری اطلاعات حساس بیش از نیاز؛
- Label و Error Message قابل دسترس؛
- تجربه RTL و Mobile-first؛
- ثبت رویداد Conversion بدون افشای اطلاعات شخصی؛
- مسیر جایگزین تماس در صورت خطای ارسال.

تماس عمومی می‌تواند فرم یا اطلاعات تماس واقعی داشته باشد؛ هیچ شماره، ایمیل، آدرس یا SLA ساختگی نباید در محتوای سایت وارد شود.

---

## 9. Pricing Architecture

صفحه Pricing باید برای ورود داده واقعی آماده باشد، بدون اینکه در این مرحله عدد یا مدل فرضی ساخته شود. ساختار داده/محتوا باید در صورت تأیید کسب‌وکار از این اجزا پشتیبانی کند:

- Plan؛
- Price؛
- Billing Model؛
- Features؛
- Limits؛
- CTA؛
- FAQ؛
- Comparison.

**جهت قیمت‌گذاری (DECIDED — جهت تجاری، نه مجوز ساخت بسته):**

- قیمت عمومی و ثابت در فاز اول تمرکز سایت نیست؛
- قیمت ممکن است بر اساس اندازه و نیاز سازمان متفاوت باشد؛
- مسیر مورد نظر این است که متقاضی برای دریافت **پیشنهاد متناسب** با Sales در تماس باشد.

این جهت، مجوز ساخت Plan، عدد، تخفیف، محدودیت یا مقایسه نیست. عمومی و ثابت کردن قیمت، و ضرورت Commerce همچنان **OPEN BUSINESS DECISION** است (بخش ۲۱).

مواردی که فعلاً **Unknown** هستند و باید پیش از انتشار تعیین شوند:

- فروش یک‌باره یا اشتراکی؛
- مبنای قیمت‌گذاری؛
- مالیات، تمدید، نصب و پشتیبانی؛
- Trial، Demo یا مذاکره‌ای بودن قیمت؛
- Refund/Cancellation؛
- تفاوت Planها و محدودیت‌ها؛
- اینکه WooCommerce یا هر روش پرداختی اصلاً لازم است یا نه.

تا قبل از تأیید رسمی، صفحه می‌تواند مدل تصمیم‌گیری و CTA Demo را توضیح دهد اما نباید قیمت، تخفیف، محدودیت یا مقایسه ساختگی نمایش دهد.

---

## 10. Content و Blog Architecture

هدف Blog این زنجیره است:

`Organic Search → Education → Trust → Product Discovery → Lead`

### خوشه‌های محتوایی اولیه برای اعتبارسنجی Search Intent

- مدیریت کلینیک؛
- سیستم مدیریت کلینیک چیست؟؛
- نرم‌افزار مدیریت مطب؛
- سیستم نوبت‌دهی؛
- مدیریت بیماران؛
- پرونده الکترونیک بیمار؛
- مدیریت پذیرش؛
- مدیریت کلینیک چندپزشکی؛
- مدیریت چند شعبه؛
- دیجیتالی کردن فرآیندهای کلینیک؛
- مدیریت صف و انتظار؛
- نسخه دیجیتال؛
- نرم‌افزار مدیریت مطب پزشک.

این‌ها Topic Proposal هستند، نه فهرست Keyword قطعی یا تعهد تولید محتوا. برای هر موضوع باید Intent، مخاطب، مرحله Funnel، شواهد محصول، CTA و ریسک حقوقی/پزشکی مشخص شود.

### مدل محتوایی قابل توسعه

- Pages؛
- Posts؛
- Features؛
- Solutions؛
- FAQs؛
- Testimonials فقط با داده واقعی؛
- Videos؛
- Screenshots.

محتوا باید تا حد ممکن از Layout جدا باشد تا تغییر متن یا Feature نیازمند بازطراحی Template نباشد. یک Content Brief حداقل شامل هدف جست‌وجو، Persona، Keyword Cluster، H1، Outline، لینک‌های داخلی، CTA، Source/Evidence و Reviewer خواهد بود.

---

## 11. SEO Architecture

SEO باید هم‌زمان با IA و Content طراحی شود، نه پس از اتمام UI.

### 11.1 SEO Foundation — پیش از ساخت صفحات

موارد زیر جزء **SEO Foundation** هستند و باید به‌اندازه‌ای زود انجام شوند که Information Architecture و Content را شکل بدهند؛ یعنی در همان زمانی که Sitemap، URL، Taxonomy و ساختار محتوا تعیین می‌شوند (Phase 2 به‌عنوان SEO Foundation) و نه پس از ساخت صفحات:

- تحقیق Keyword و Search Intent فارسی و کاربران ایرانی؛
- معماری URL و Sitemap؛
- نگاشت هر صفحه به Intent و نقش آن در Funnel؛
- معماری Internal Linking و Breadcrumb؛
- استراتژی اولیه Title، Meta Description، Canonical و Indexability؛
- برنامه‌ریزی Schema و Structured Data متناسب با محتوای واقعی؛
- تصمیم درباره Slug فارسی/انگلیسی و الگوی Canonical.

اصل حاکم: تصمیم‌های SEO Foundation نباید پس از ساخته‌شدن Templateها و صفحات کشف شوند؛ کشف دیرهنگام این تصمیم‌ها به بازکاری IA، Content و Template منجر می‌شود.

### 11.2 SEO Hardening — راستی‌آزمایی و آمادگی انتشار

**SEO Hardening** مرحله‌ای بعدی و محدود به راستی‌آزمایی پیاده‌سازی موارد بالا است، نه کشف معماری سایت:

- بررسی این‌که Metadata، Canonical، Sitemap و Robots همان‌طور که در SEO Foundation تعیین شده در صفحات واقعی پیاده شده‌اند؛
- بررسی Schema روی محتوای واقعی و انطباق آن با محتوای قابل مشاهده؛
- بررسی Crawlability، Internal Linkها، Orphan Pageها، Redirectها و شکست‌های Indexing؛
- بررسی H1/H2/H3، Alt Text و Duplicate/Thin Content؛
- آمادگی انتشار: Search Console، Sitemap نهایی، Indexability و پایش اولیه.

این مرحله در ترتیب فازها به‌عنوان «9 — SEO Hardening» آورده شده است؛ SEO Foundation بخشی از Phase 2 است و فاز مستقلی برای آن ایجاد نمی‌شود.

### الزامات فنی و محتوایی

- URLهای کوتاه و پایدار؛
- Semantic HTML؛
- یک H1 منطقی برای هر صفحه؛
- سلسله‌مراتب H2/H3؛
- Meta Title و Meta Description اختصاصی؛
- Canonical؛
- XML Sitemap؛
- Robots؛
- Breadcrumb؛
- Open Graph و در صورت نیاز Twitter/X metadata؛
- Schema.org متناسب با محتوای واقعی؛
- Alt Text توصیفی؛
- Internal Linking و جلوگیری از Orphan Page؛
- Keyword Mapping بر اساس Search Intent فارسی و کاربران ایرانی؛
- Content Clusters و Cornerstone Content؛
- صفحات مستقل Feature و Solution در صورت داشتن ارزش جست‌وجویی و محصولی؛
- Blog Archive و Single Article قابل Crawl.

Schema، Review، FAQ، Organization، Product یا هر نوع Structured Data فقط در صورت انطباق با محتوای قابل مشاهده و قواعد موتور جست‌وجو استفاده می‌شود. Keyword Stuffing، متن پنهان و ادعای رتبه/برتری ممنوع است.

---

## 12. WordPress و Elementor Architecture

مبنای هدف برای اجرای آینده `WordPress + Elementor` است، اما در Repository فعلی نصب یا پیکربندی آن تأیید نشده است.

اصل اجرایی:

> Elementor-native + Maintainable + Reusable

### Global و Templateهای مورد انتظار

- Global Colors؛
- Global Typography؛
- Global Spacing؛
- Buttons؛
- Containers؛
- Cards؛
- Forms؛
- Headings؛
- CTA؛
- Header؛
- Footer؛
- Single Post؛
- Blog Archive؛
- Feature Page؛
- Solution Page؛
- CTA Section؛
- Feature Card؛
- Pricing Card؛
- FAQ؛
- Screenshot Gallery؛
- Testimonial فقط در صورت وجود داده واقعی.

این فهرست Target Architecture است، نه نشانه وجود Templateها. از Duplicate کردن Layout، Styleهای inline ناسازگار، DOM غیرضروری و وابستگی بی‌دلیل به Widgetهای سنگین باید جلوگیری شود. هر Template باید مالک، محل استفاده، Variant و محدودیت ویرایش مشخص داشته باشد.

---

## 13. Design System و RTL/Persian UX

### جهت بصری

جهت مورد نظر: **Premium Medical Technology + Professional SaaS + Trust**.

سایت نباید به قالب پزشکی قدیمی، قالب عمومی WordPress، Landing Page ارزان، SaaS فانتزی یا سایت شرکتی خشک شبیه شود. همچنین باید از کارت‌زدگی، Shadow سنگین، Gradient بی‌دلیل، Animation زیاد، Slider غیرضروری، Hero پرمتن، فضای خالی بی‌هدف و UI شلوغ پرهیز کند.

**شخصیت برند (DECIDED):** مدرن، حرفه‌ای، قابل‌اعتماد، متناسب با حوزه سلامت، پرمیوم اما آرام.

پرهیز از:

- ظاهر نرم‌افزار اداری/قدیمی و خشک؛
- برندینگ بازیگوش و استارتاپی بیش‌ازحد؛
- ظاهر عمومی و Gradient-محور شبیه ابزارهای AI/SaaS؛
- تقلید بصری از یک رقیب مشخص.

ابزار رسیدن به این شخصیت: ساختار تمیز، فاصله‌گذاری سخاوتمندانه اما کارآمد، تایپوگرافی قوی فارسی، سلسله‌مراتب روشن، نمایش واقعی محصول و CTAهای واضح.

**معماری برند (DECIDED — با یک تصمیم باز):** CPMS نام فعلی محصول است و مخفف **Clinic Practice Management System**. انتخاب یک برند تجاری/مادر جداگانه ممکن است بعداً انجام شود؛ بنابراین معماری سایت باید از گره‌خوردن غیرضروری همه عناصر هویتی قابلی‌استفاده‌مجدد به CPMS پرهیز کند تا تصمیم برند بعدی پرهزینه نشود. برند آینده در این سند نام‌گذاری یا ساخته نمی‌شود؛ انتخاب برند نهایی **OPEN BUSINESS DECISION** است (بخش ۲۱).

### اجزای Design System

- Typography فارسی خوانا؛
- Color roles، Contrast و حالت‌های تعاملی؛
- Spacing و Container؛
- Button و Link؛
- Card و Feature block؛
- Form، Field، Validation و Error؛
- Icon و Alignment؛
- Screenshot/Video frame؛
- Table و Comparison؛
- FAQ؛
- Focus، Hover و Disabled state؛
- Responsive و Reduced Motion rules.

انتخاب فونت، رنگ و مقادیر نهایی در Design System Phase انجام می‌شود و در این سند به‌صورت فرضی تعیین نشده است.

### RTL

- RTL واقعی در Layout و Flow؛
- Typography و فاصله‌گذاری متناسب فارسی؛
- استفاده از اعداد فارسی/لاتین بر اساس Context محصول؛
- Navigation، Breadcrumb، Form، Table و Icon alignment سازگار با RTL؛
- Focus order و Keyboard order صحیح؛
- بررسی مستقل Mobile RTL.

Responsive نباید فقط کوچک‌کردن Desktop باشد؛ برای Mobile، Tablet و Desktop رفتار، اولویت محتوا، Navigation، Form و CTA باید به‌صورت مستقل بررسی شود.

---

## 14. Responsive، Performance و Accessibility

### Breakpoint و تست

حداقل بازه‌های بررسی:

- Mobile: `320–767`؛
- Tablet: `768–1024`؛
- Laptop: `1025–1365`؛
- Desktop: `1366+`.

هر صفحه مهم باید حداقل در Mobile، Tablet و Desktop بازبینی شود؛ Safari در صورت فراهم بودن محیط تست اضافه می‌شود.

### Performance — الزامات کیفی و بودجه

- WebP/AVIF در صورت سازگاری و نیاز؛
- ابعاد واقعی و مناسب Image؛
- Lazy Loading غیر بحرانی؛
- حداقل Font Weight و Font Loading منطقی؛
- Critical Asset فقط در صورت ضرورت؛
- حداقل JS/CSS و Third-party Script؛
- عدم استفاده از Slider یا Background Video سنگین بدون دلیل؛
- بهینه‌سازی Elementor و جلوگیری از DOM بیش‌ازحد پیچیده؛
- Cache/CDN فقط پس از شناخت Hosting؛
- اندازه‌گیری تجربه واقعی و Core Web Vitals، نه اتکا به امتیاز مصنوعی Lighthouse.

این الزامات **کیفی** هستند، در هر Slice به‌صورت متناسب با همان Slice اعمال می‌شوند (بخش ۱۹) و تا زمان وجود محیط و صفحه نماینده معتبر باقی می‌مانند. هر **Performance Budget عددی** (حد آستانه Payload، Font، Third-party Script، Asset و شاخص‌های Core Web Vitals) فقط پس از وجود محیط نماینده و اندازه‌گیری Baseline قابل تعیین است؛ تا آن زمان این اعداد **Unknown** هستند و نباید حدس زده یا در سند ثبت شوند (به Open Questions).

### Accessibility

- Keyboard navigation؛
- Focus state واضح؛
- Contrast مناسب؛
- Alt Text؛
- Semantic HTML؛
- Label فرم؛
- خطای قابل فهم و قابل دسترس؛
- Reduced Motion؛
- Typography خوانا؛
- Button و Navigation قابل استفاده؛
- تست در RTL.

---

## 15. Security، Privacy و Analytics

### Security و داده

حداقل الزامات معماری:

- Server-side validation؛
- Sanitization و Escaping؛
- Nonce؛
- Rate limiting؛
- Spam protection؛
- سطح دسترسی حداقلی؛
- به‌روزرسانی کنترل‌شده WordPress/Plugin در صورت استفاده؛
- Backup و Restore strategy؛
- عدم افشای اطلاعات حساس؛
- ثبت و نگهداری داده‌های Lead مطابق سیاست حفظ حریم خصوصی.

جزئیات ابزار، Provider و Retention Policy تا زمان Discovery مشخص نیست.

### Analytics و Conversion Tracking

معماری باید امکان اندازه‌گیری این رویدادها را با حداقل بار JavaScript فراهم کند:

- Page View؛
- CTA Click؛
- Demo Request؛
- Pricing View؛
- Contact Submission؛
- Feature Page View؛
- Video Play؛
- Scroll/Engagement در صورت نیاز واقعی.

رویدادها نباید مقدار نام، موبایل یا سایر داده‌های شخصی فرم را ارسال کنند. ابزار Analytics، Consent، مقصد داده و Naming Convention باید قبل از پیاده‌سازی تأیید شوند.

### موفقیت و اندازه‌گیری (DECIDED)

- **موفقیت اصلی کسب‌وکار:** تولید پیوسته Lead واجد شرایط از پزشکان/تصمیم‌گیرندگان کلینیک و حرکت معنادار از بازدید مناسب به دمو/مشاوره و در نهایت مشتری؛
- **ترافیک خام معیار ثانویه است** و به‌تنهایی موفقیت محسوب نمی‌شود؛
- اندازه‌گیری باید بر مسیر Demo/Lead و کیفیت آن متمرکز باشد، نه صرفاً حجم بازدید.

**DECIDED:** در این مرحله هیچ ابزار Analytics نصب یا انتخاب نمی‌شود؛ فقط الزامات اندازه‌گیری آینده مستند می‌شود (رویدادهای بالا). انتخاب Provider، Consent و Naming Convention همچنان **DEFERRED UNTIL IMPLEMENTATION/ENVIRONMENT** است.

---

## 16. Trust، Media، Search و صفحات سیستمی

### Trust Architecture

**سلسله‌مراتب اعتماد (DECIDED):** اولین پرسش اعتماد این است: «آیا این محصول واقعاً با نحوه کار یک کلینیک واقعی تناسب دارد؟» پس از آن، اعتماد با توضیح شفاف امنیت/دسترسی به داده و سپس اطلاعات Onboarding/آموزش/پشتیبانی تقویت می‌شود. همه این ادعاها نیازمند تأیید هستند.

فقط این نوع Evidenceها، پس از تأیید، مجاز به انتشار هستند:

- Screenshot و Video واقعی CPMS؛
- Workflow واقعی؛
- Documentation؛
- Security Practice مستند؛
- Support واقعی؛
- Company information واقعی؛
- Testimonial یا Customer Logo با اجازه و قابل اثبات.

Testimonial ساختگی، آمار ساختگی، مشتری فرضی، Review جعلی و لوگوی بدون اجازه ممنوع است. عبارت‌های «کامل‌ترین»، «بهترین»، «بدون رقیب»، «امن‌ترین» و «100٪ امن» بدون سند استفاده نمی‌شوند و ادعای انطباق قانونی/استاندارد تأییدنشده ممنوع است.

**قاعده Social Proof (DECIDED):** هیچ Testimonial، لوگوی مشتری، آمار استفاده، عدد پذیرش/نصب، Case Study یا ادعای مشابه بدون شواهد واقعی و اجازه انتشار مجاز نیست. تا آن زمان، اعتماد باید از این مسیرها ساخته شود: شواهد واقعی محصول، توضیح شفاف جریان کار، توضیح صادقانه امنیت/دسترسی، دمو، و در آینده شواهد واقعی مشتری در صورت وجود.

### Support (جهت آینده — فقط خدمات واقعی)

پشتیبانی باید در آینده به‌عنوان بخشی از تجربه محصول/مشتری معرفی شود: Onboarding/راه‌اندازی، آموزش، مستندات و پشتیبانی/همراهی مستمر. فقط خدماتی که واقعاً ارائه می‌شوند مجاز به تبلیغ هستند؛ ادعاهای عمومی مانند «پشتیبانی ۲۴/۷» بدون سند و تأیید مجاز نیست. جزئیات مدل پشتیبانی **REQUIRES PRODUCT VERIFICATION** است.

### Screenshot و Video

Screenshot باید واقعی، باکیفیت، دارای Context، بهینه‌شده و در صورت وجود برای Desktop/Tablet/Mobile باشد؛ Crop نباید معنا یا UI را تحریف کند. Video باید کوتاه، سریع و Product-focused باشد؛ Poster و Lazy Load آن باید از ابتدا در نظر گرفته شود.

**قواعد اجباری Media محصول (DECIDED):**

- فقط داده **سنتتیک/Demo**؛ هیچ اطلاعات بیمار واقعی یا PHI در Screenshot/Video استفاده نمی‌شود؛
- Media باید **عملکرد واقعی** محصول را نشان دهد؛ UI جعلی که ممکن است با قابلیت تحویل‌شده اشتباه شود ممنوع است؛
- Media بهینه و Responsive برای Mobile/Tablet/Desktop؛
- Alt Text مفید و فارسی؛
- بارگذاری سبک Video (Poster، Lazy Load، بدون Autoplay سنگین).

مالک محصول انتظار دارد Screenshot/Video واقعی CPMS در آینده در دسترس قرار گیرد؛ تا آن زمان این موارد **REQUIRES PRODUCT VERIFICATION** هستند و Media ساختگی جای آن‌ها را نمی‌گیرد.

### Search و Empty State

صفحه Search باید به‌صورت آینده‌پذیر Blog، Feature، Solution و سایر Content را جست‌وجو کند. Empty State باید پیام روشن، پیشنهاد جست‌وجوی جدید و لینک مسیرهای مهم داشته باشد. Empty Stateهای فرم، Blog و بخش‌های تعاملی نیز طراحی می‌شوند.

### Legal و 404

صفحات زیر در IA رزرو می‌شوند:

- Terms؛
- Privacy Policy؛
- Refund/Cancellation Policy؛
- Cookie Policy در صورت نیاز؛
- Legal Notice در صورت نیاز.

متن حقوقی واقعی بعداً از منبع معتبر تأمین و تأیید می‌شود؛ متن نمونه نباید به‌عنوان سیاست رسمی شرکت منتشر شود. صفحه 404 باید پیام واضح، Home، Search و مسیرهای اصلی را ارائه کند.

---

## 17. فازهای اجرای پروژه و خروجی‌ها

ترتیب زیر وابستگی‌ها را مشخص می‌کند. هر فاز یک Slice مستند و قابل بازبینی دارد؛ شروع فاز بعدی به Gate همان فاز وابسته است.

### شرط شروع Implementation — Baseline پذیرفته‌شده

پیش از شروع Implementation، فازهای Planning/Discovery باید یک Baseline پذیرفته‌شده برای موارد زیر تولید کنند:

- Positioning کسب‌وکار؛
- مخاطب هدف (اصلی/ثانویه)؛
- استراتژی Conversion (دمو/مشاوره)؛
- الزام Product Truth Inventory (تعریف‌شده و آماده اجرا)؛
- Information Architecture / Sitemap؛
- SEO Foundation؛
- جهت طراحی و شخصیت برند؛
- اصول Performance (کیفی)؛
- قواعد محتوا و ادعا (Claim rules).

**توجه:** خودِ Product Truth Inventory تا زمانی که شواهد واقعی محصول بررسی نشده باشد **تکمیل‌شده علامت‌گذاری نمی‌شود**؛ در این مرحله فقط الزام، دسته‌بندی و قالب رکورد آن تعریف شده است.

**تفکیک Implementation از Publication (DECIDED):** عبور از این شرایط (Implementation Gate) فقط مجوز **شروع پیاده‌سازی سایت** است و به‌تنهایی مجوز **انتشار عمومی سایت (Publication Gate)** را نمی‌دهد. پیاده‌سازی سایت می‌تواند در حین ادامه‌ی توسعه محصول (توسعه موازی) آغاز شود و منتظر کامل‌شدن کل پلاگین نیست؛ اما انتشار عمومی سایت مستلزم آمادگی Launch محصول و بازتأیید نهایی Product Truth طبق Launch Truth Gate (`docs/PRODUCT-TRUTH.md`) است.

| فاز | فعالیت‌های اصلی | خروجی / Gate |
|---|---|---|
| 0 — Discovery & Repository Audit | بررسی وضعیت مخزن، WordPress، Elementor، Theme، Plugin، Asset، محدودیت و Technical Baseline | Discovery Report، ثبت Unknownها و تصمیم‌گیری مستند درباره Theme Architecture بر مبنای شواهد |
| 1 — Product & Brand Foundation | Positioning، مخاطب اصلی/ثانویه، Value Proposition، Persona، Messaging، استراتژی Conversion (دمو/مشاوره)، Content hierarchy، Brand direction/character، اصول Performance و Claim rules | Product/Brand Foundation تأییدشده و Baseline تصمیم‌های کسب‌وکار (الزام Product Truth Inventory تعریف‌شده، اما تکمیل‌نشده) |
| 2 — Information Architecture و SEO Foundation | Sitemap، Navigation، Page hierarchy، URL، Feature/Solution/Blog taxonomy، Internal Linking و SEO Foundation: Keyword/Search Intent، نگاشت صفحه به Intent، استراتژی اولیه Title/Meta/Canonical/Indexability و برنامه‌ریزی Schema | Approved Information Architecture و SEO Foundation مستند |
| 3 — Design System | Typography، Color، Spacing، Button، Card، Form، Icon، Container، Responsive و RTL rules | Design System و states |
| 4 — Elementor Foundation | Global settings، Header، Footer، Template، Reusable sections و Responsive configuration | Maintainable Elementor Foundation |
| 5 — Homepage | ساخت معماری کامل Home و بررسی مسیر Conversion | Gate A: Desktop + Mobile visual review |
| 6 — Core Conversion Pages | Features، Solutions، Pricing، Demo، Contact و FAQ | بررسی Function، Content و Conversion |
| 7 — Feature Pages | ساخت Feature Landing Pageهای مستقل بر اساس قابلیت‌های تأییدشده | Gate B: Feature/Solution templates |
| 8 — Content / Blog | Taxonomy، Archive، Article layout، Brief و SEO content structure بر اساس SEO Foundation تعیین‌شده در Phase 2 | Blog architecture و Template |
| 9 — SEO Hardening | راستی‌آزمایی پیاده‌سازی SEO Foundation: Metadata، Canonical، Schema، Sitemap، Robots، Indexing، Internal Links و Orphan Pageها در صفحات ساخته‌شده | SEO acceptance checklist |
| 10 — Performance | Image، Font، CSS، JS، Elementor، Cache و Core Web Vitals، پس از وجود محیط/صفحه نماینده و بر مبنای Performance Budget تعیین‌شده در همان مرحله | Performance baseline، بودجه عددی مصوب و اصلاحات |
| 11 — Security & Accessibility | فرم، Validation، Spam، Permission، Keyboard، Contrast، Focus و RTL QA | Security/Accessibility checklist |
| 12 — QA | Responsive، RTL، Browser، Forms، Links، Navigation، Search، 404، SEO، Accessibility و Performance | Defect list و Regression pass |
| 13 — Conversion QA | CTA، Demo friction، Pricing clarity، Navigation و User journey | Conversion review بدون تغییر سلیقه‌ای |
| 14 — Launch Readiness | Backup، Security، Performance، SEO، Analytics، Forms، Legal، Indexing، Robots، Sitemap و Final QA | Launch checklist با مالک و وضعیت هر مورد |

### ترتیب Sliceهای پیشنهادی برای کاهش ریسک

1. ابتدا تصمیم‌های کسب‌وکار، الزام Product Truth و Unknownها، نه UI؛
2. سپس IA و Content model؛
3. بعد Design System و Templateهای reusable؛
4. سپس Home برای اعتبارسنجی پیام؛
5. بعد Feature/Solution و صفحات Conversion؛
6. سپس Blog، Measurement و SEO Hardening؛
7. در پایان Hardening، QA و Launch Readiness.

---

## 18. Visual Approval Gates

برای تغییر کوچک، تأیید دستی مالک لازم نیست؛ تیم اجرا باید با Browser Test، Responsive Test و QA آن را کنترل کند. تأیید بصری در نقاط اصلی انجام می‌شود:

- **Gate A:** Homepage در Desktop و Mobile؛
- **Gate B:** Templateهای Feature و Solution؛
- **Gate C:** صفحات اصلی Conversion شامل Pricing، Demo، Contact و FAQ؛
- **Gate D:** Final Website پس از QA، Content، SEO، Performance و Accessibility.

هر Gate باید با Screenshot/Preview، دستگاه/Breakpoint، نسخه محتوای بررسی‌شده، Known Limitation و فهرست تغییرات همراه باشد. تأیید بصری جایگزین تست فنی نیست.

---

## 19. Definition of Done

هیچ Slice صرفاً به دلیل ساخته‌شدن صفحه Done نیست. Definition of Done **به نسبت دامنه و نوع همان Slice محدود تعریف‌شده اعمال می‌شود**، نه به‌صورت فهرست ثابت برای همه تغییرات. معیاری که به Slice مربوط نیست، برای آن Slice لازم نیست.

### 19.1 معیارهای پایه (برای همه Sliceها)

- **Scope:** تغییر محدود به همان Slice تعریف‌شده باقی مانده و خارج از Scope گسترش نیافته است؛
- **Regression:** تغییر، صفحات، Templateها و رفتارهای مرتبط را خراب نکرده است؛
- **Content integrity:** ادعاها با Product Truth Inventory (دسته `AVAILABLE NOW`) و Source تأیید شده‌اند، قابلیت‌های در حال توسعه به‌عنوان موجود معرفی نشده‌اند و متن نمونه به‌عنوان واقعیت منتشر نشده است؛
- **Evidence:** Screenshot، Testimonial، Logo، عدد، آمار یا قیمت بدون منبع منتشر نشده است؛
- **Documentation:** تصمیم‌ها، محدودیت‌ها، نتیجه Review و موارد Unknown ثبت شده‌اند؛
- **Reporting:** گزارش Slice مطابق پیوست B ارائه شده است.

### 19.2 معیارهای متناسب با نوع Slice

هر Slice فقط معیارهای متناسب با خودش را می‌گیرد:

- **Slice مستنداتی یا محتوایی:** شواهد مربوط به مستندات و محتوا کافی است؛ یعنی صحت متن، انطباق با Source، نبود ادعای بی‌مدرک و به‌روز بودن این سند. تست مرورگر، Visual QA، Performance و بررسی‌های امنیتی فرم برای این نوع Slice لازم نیست؛
- **Slice قابلیت مرورگرمحور یا Frontend قابل مشاهده:** شواهد واقعی Responsive و RTL در مرورگر، در محدوده‌ای که محیط اجرا اجازه می‌دهد؛ در صورت نبود محیط اجرایی، محدودیت محیط به‌صراحت به‌عنوان Known Limitation ثبت می‌شود و ذکر «انجام شد» بدون اجرا مجاز نیست؛
- **Slice مرتبط با SEO:** معیارهای SEO در حدی که به همان صفحه، نوع محتوا یا مورد SEO مربوط است اعمال می‌شود؛
- **Slice مرتبط با Performance:** اندازه‌گیری فقط روی صفحات/محیط‌های نماینده و قابل اجرا انجام می‌شود؛ تا زمانی که چنین محیطی وجود ندارد، فقط الزامات کیفی بخش ۱۴ اعمال می‌شوند؛
- **Slice مرتبط با فرم، داده، دسترسی یا ورودی کاربر:** Validation، Sanitization، Nonce، Rate Limit، Permission، Spam و Data handling اعمال می‌شود؛ برای Sliceهای نامرتبط لازم نیست.

### 19.3 سطح Template، Release و Launch

- **Template/Release:** معیارهای کامل Functional، Responsive، RTL، Accessibility، SEO، Performance و Security در سطح Template یا Release اعمال می‌شوند، نه برای هر تغییر کوچک؛
- **Launch:** معیارهای Launch و Gate D بدون کاهش باقی می‌مانند. تنظیم متناسب DoD با نوع Slice، **سطح کیفیت نهایی انتشار را پایین نمی‌آورد** و بخشی از Gate D را حذف نمی‌کند.

---

## 20. Scope فعلی و موارد عمداً ساخته‌نشده

### در Scope این Roadmap

- معماری سایت معرفی و فروش CPMS؛
- Product Marketing، Education و Lead Generation؛
- WordPress + Elementor به‌عنوان Target Implementation، پس از تأیید baseline؛
- RTL فارسی، Responsive، SEO، Performance، Accessibility، Security و Analytics architecture؛
- صفحات Core، Feature، Solution، Blog، Legal، Search و System؛
- فرآیند تأیید بصری، QA و Launch Readiness.

### خارج از Scope فعلی

مگر با تصمیم جداگانه و ثبت‌شده:

- SaaS Architecture؛
- Client Dashboard؛
- Mobile App، Android App یا iOS App؛
- CRM پیچیده؛
- Ticketing System کامل؛
- سایت چندزبانه یا English Website؛
- Marketplace؛
- قابلیت‌های CPMS که وجودشان تأیید نشده است؛
- WooCommerce کامل، مگر پس از تأیید مدل فروش؛
- Checkout، پرداخت آنلاین یا خرید مستقیم در فاز اول (مسیر اولیه Assisted Sale است؛ بخش ۸)؛
- Marketing Automation پیچیده؛
- پیاده‌سازی Theme، Plugin، Elementor Template یا Configuration در این Slice مستنداتی؛
- تولید و انتشار محتوای نهایی؛
- Deployment، Migration یا تغییر Production.

این Roadmap خودبه‌خود هیچ قابلیت جدیدی برای CPMS ایجاد نمی‌کند و Feature Roadmap محصول نیز نیست.

---

## 21. Risks و Open Questions

### وضعیت تصمیم‌ها (خلاصه)

**DECIDED (در این سند ثبت شد):** هدف تجاری اصلی و تعریف موفقیت (Lead واجد شرایط)، مخاطب اصلی/ثانویه، CTA اصلی و مسیر Assisted Sale، جهت قیمت‌گذاری (پیشنهاد متناسب با نیاز سازمان)، جهت Positioning (محصول یکپارچه مدیریت کلینیک)، ترتیب روایت Homepage و قواعد Problem Framing، سلسله‌مراتب Trust، شخصیت برند، انعطاف معماری برند، قواعد Social Proof و Media، جهت Support، مرجع تصمیم‌گیری روزمره، الزام Product Truth Gate، و توسعه موازی سایت/محصول با دروازه‌های مجزای Implementation/Publication (سیاست «عدم انتشار عمومی و عدم Index شدن عمدی پیش از آمادگی محصول»؛ مرجع زنده: `docs/PRODUCT-TRUTH.md`).

**REQUIRES PRODUCT VERIFICATION:** هر ادعای قابلیت، از جمله تم‌های مورد نظر مالک — فرآیندهای مالی، دریافت/تسویه پرداخت، رفتار چندکلینیکی، نقش/دسترسی، تفکیک اطلاعات، پیاده‌سازی امنیت و هر جریان کاری مشخص دیگر؛ همچنین Media واقعی محصول، مدل Support و تناسب محصول با مخاطب اصلی.

**OPEN BUSINESS DECISION:** مدل فروش و عمومی/ثابت بودن قیمت، فعال‌سازی Commerce یا خرید مستقیم، انتخاب برند تجاری/مادر نهایی، و هر تغییر مادی در بازار هدف یا مدل فروش.

**DEFERRED UNTIL IMPLEMENTATION/ENVIRONMENT:** معماری Theme (پس از Audit)، Performance Budget عددی (پس از Baseline)، Provider/ابزار Analytics و Consent، Hosting/CDN/Staging، استاندارد Accessibility و Browser/Device matrix، مدل محتوایی (CPT/ACF/Elementor Pro) و جزئیات ابزارها.

### ریسک‌های اصلی و کنترل پیشنهادی

| ریسک | اثر | کنترل |
|---|---|---|
| Repository تقریباً خالی است | ناآگاهی از baseline و هزینه دوباره‌کاری | تکمیل Phase 0 و ثبت Evidence پیش از اجرا |
| ادعای قابلیت پیاده‌نشده | از دست رفتن اعتماد و ریسک حقوقی/فروش | Product Fact Sheet و Review محتوایی |
| انتخاب زودهنگام Layout/Elementor | قفل‌شدن معماری و Duplicate | Content model و Templateهای reusable |
| محتوای فارسی بدون Intent | ترافیک کم‌کیفیت و Keyword Stuffing | Keyword Mapping و Content Brief |
| فرم Lead بدون Privacy/Sales owner | Lead از دست‌رفته یا ریسک داده | تعیین مقصد، مالک، Consent و Retention |
| Media و Third-party Script سنگین | افت Core Web Vitals و Conversion | Performance Budget و Lazy/conditional loading |
| Scope creep | تأخیر و مخدوش‌شدن هدف سایت | Change Control و Out-of-Scope فهرست‌شده |
| داده Trust ساختگی یا بدون اجازه | آسیب جدی به اعتبار | Evidence registry و تأیید انتشار |
| تبدیل «تم مورد نظر مالک» به ادعای منتشرشده | ادعای قابلیت تأییدنشده و ریسک اعتماد/فروش | Product Truth Gate و رکورد شواهد پیش از هر متن عمومی |
| تغییر تصمیم محصول در میانه اجرا | ناسازگاری IA و Template | ثبت ADR/تصمیم معماری پیش از تغییر |

### سؤال‌های باز که قبل از اجرا باید پاسخ بگیرند

1. نسخه و فهرست دقیق قابلیت‌های فعلی CPMS چیست و کدام موارد محدود یا در حال توسعه‌اند؟
2. CPMS دقیقاً روی چه WordPress/Plugin/Theme/محیطی اجرا می‌شود و آیا Self-hosted بودن قابل ادعاست؟
3. آیا محصول واقعاً Patient، Doctor، Reception، Waiting، Visit، Prescription، Payment و Record را پوشش می‌دهد؟
4. مدل فروش، Planها، Billing، Trial، نصب، پشتیبانی، Refund و Payment چیست؟
5. مالک Lead چه کسی است، مقصد داده کجاست و زمان پاسخ Sales چقدر است؟
6. کدام فیلدهای Demo ضروری‌اند و مبنای Privacy/Consent چیست؟
7. نام رسمی شرکت، اطلاعات تماس، دامنه، شبکه‌های اجتماعی و اطلاعات حقوقی تأییدشده چیست؟
8. آیا Screenshot، Video، Testimonial، Logo یا Customer Story واقعی و قابل انتشار وجود دارد؟
9. بازار هدف از نظر شهر، نوع مرکز، زبان و مقررات داده دقیقاً چیست؟
10. Provider یا ابزار Analytics، Consent، Search Console، Hosting، CDN، Backup و Staging چیست؟
11. آیا Search سایت باید در فاز اول اجرا شود یا فقط IA و Empty State آن آماده شود؟
12. چه استاندارد Accessibility و چه Browser/Device matrix مبنای پذیرش است؟
13. آیا صفحات Pricing، Legal، Support و About در فاز اول محتوای تأییدشده دارند؟
14. Slug فارسی یا انگلیسی و Canonical strategy برای SEO فارسی کدام است؟
15. آیا مدل محتوا به Custom Post Type/ACF/Elementor Pro یا ابزار دیگری نیاز دارد؟ این تصمیم بدون Audit نباید گرفته شود.

#### Open Question — Theme Architecture (تصمیم عمداً باز)

انتخاب بین **Lightweight Custom Theme** و **Lightweight Child/Base-Theme Architecture** عمداً پاسخ داده نشده است. این تصمیم باید در Phase 0 — Discovery & Repository Audit و **بر مبنای شواهد همان Audit** گرفته شود، نه از پیش و نه به‌صورت ضمنی در Phase 4. هیچ Theme یا رویکردی در این سند پیش‌انتخاب نشده است.

معیارهای ارزیابی تصمیم:

- قابلیت نگهداری و خوانایی ساختار؛
- عملکرد و وزن Frontend؛
- قابلیت ویرایش با Elementor؛
- رفتار به‌روزرسانی (Update) و ریسک از دست رفتن تغییرات؛
- RTL؛
- Accessibility؛
- SEO؛
- امنیت؛
- Deployment و فرآیند انتشار؛
- سازگاری با WooCommerce **فقط در صورتی که Commerce بعداً تأیید شود**.

#### Open Question — Performance Budget (تصمیم عمداً باز)

هیچ عدد مصوبی برای بودجه Performance وجود ندارد. **Performance Budget عددی** باید فقط پس از وجود محیط نماینده (WordPress/Elementor قابل اجرا) و اندازه‌گیری Baseline تعیین شود. تا آن زمان، آستانه‌های عددی Payload، Asset، Font، Third-party Script و Core Web Vitals **Unknown** باقی می‌مانند و نباید حدس زده شوند.

تا زمان تعیین بودجه عددی، الزامات **کیفی** بخش ۱۴ معتبر است: کم‌بودن Payload اولیه، حداقل Third-party Script، Media بهینه و Responsive، تعداد محدود Font Weight، DOM محدود، بارگذاری شرطی Assetها و توجه به Core Web Vitals.

مالک تصمیم: مالک فنی/اجرایی پروژه، با تأیید مالک محصول. زمان تصمیم: پس از Baseline در Phase 0 و به‌روزرسانی بودجه در Phase 10 — Performance.

---

## 22. Change Control، Repository Discipline و آینده معماری

اگر در زمان اجرا نیاز جدیدی پدیدار شد یا معلوم شد Elementor، مدل محتوا، Taxonomy یا SEO Architecture کافی نیست:

1. مسئله، شواهد و اثر آن بر Scope/Performance/SEO/Security ثبت شود؛
2. گزینه‌های معماری و هزینه/ریسک هر گزینه بررسی شود؛
3. تصمیم مالک محصول و مسئول فنی ثبت شود؛
4. این Roadmap یا Decision Record قبل از اجرای تغییر به‌روزرسانی شود؛
5. اثر تغییر بر Gateها، DoD و مسیرهای موجود QA شود.

Roadmap مرجع معماری است، اما نباید جلوی تغییر ضروری را بگیرد و نباید بهانه ساخت قابلیت خارج از Scope شود.

### مرجع تصمیم‌گیری (DECIDED)

- تصمیم‌های روتین Website/Product Marketing/UX/SEO/Conversion توسط **Website Director** گرفته می‌شود و نیازی به طرح مکرر هر مورد با مالک محصول ندارد؛
- فقط تصمیم‌های تجاری/محصولی بزرگ که با شواهد قابل حل نیستند به مالک محصول ارجاع می‌شوند:
  - تغییر مادی بازار هدف؛
  - تغییر مادی مدل فروش؛
  - تصمیم نهایی برند تجاری/مادر؛
  - عمومی و ثابت کردن قیمت؛
  - فعال‌کردن Commerce یا خرید مستقیم؛
  - هر تصمیم دیگری که جهت تجاری/محصولی را به‌صورت مادی تغییر دهد.
- این بخش یک **قاعده حاکمیت برنامه‌ریزی** است و مجوز Implementation نیست.

### 22.1 انضباط Repository، Git و PR (قواعد همه Sliceهای آینده)

این قواعد برای **همه Sliceهای آینده** است، نه فقط PR مستنداتی جاری. محدودیت‌های همین Slice در بخش ۲۳ آمده‌اند و جای این قواعد را نمی‌گیرند. خلاصه و در حد یک Roadmap:

- **پیش از هر Write:** ریشه Repository، Branch، HEAD، وضعیت Working Tree، وضعیت به‌روز `main` و PR فعال مربوطه را بررسی کنید؛
- **History فقط Forward-only:** تاریخچه منتشرشده بازنویسی نمی‌شود؛
- **ممنوعیت Reset مخرب:** `reset --hard`، پاک‌کردن تغییرات و حذف کار ناشناس مجاز نیست؛
- **ممنوعیت `git clean` روی کار ناشناس:** تا زمانی که مالکیت فایل‌های Untracked مشخص نشده، پاک‌سازی مجاز نیست؛
- **ممنوعیت Rebase تاریخچه مشترک، Force-push و هر نوع Rewrite تاریخچه؛**
- **Push مستقیم به `main` ممنوع است؛** هر تغییر از طریق PR انجام می‌شود؛
- **ممنوعیت Commit خالی یا Commit صرفاً برای تحریک CI؛**
- **یک Task محدود در هر PR**، تا حد امکان؛
- **شواهد باید به SHA دقیق گره بخورد:** مصرف‌کننده شواهد باید بداند شواهد به کدام Commit تعلق دارد؛
- **Diff و Status پیش و پس از تغییر بررسی شود** و فقط فایل‌های موردنظر تغییر کرده باشند؛
- **هیچ Merge بدون شواهد پذیرفته‌شده انجام نمی‌شود؛** Review/Gate مربوطه باید پیش از Merge پذیرفته شده باشد؛
- **شکل Merge:** Merge Commit، مگر این‌که سیاست Repository در آینده طور دیگری تعیین کند؛
- **Branch منبع پس از Merge حذف نمی‌شود**، مگر این‌که سیاست Repository در آینده تغییر کند؛
- **Agent نوشتاری که یک PR را با موفقیت Merge می‌کند، برای همیشه از عملیات نوشتاری بعدی کنار گذاشته می‌شود؛** ادامه کار فقط با Agent/Reviewer تازه انجام می‌شود.

روش اجرایی این قواعد در پیوست B ثبت شده است.

---

## 23. وضعیت این Slice مستنداتی

- این Slice فقط برای ثبت Roadmap و مستندات معماری است.
- هیچ Theme، Plugin، Elementor Template، WordPress Configuration، package یا deployment نباید در این Slice تغییر کند.
- فایل‌های تحویل‌شده این Slice (اصلاح F-01): `docs/ROADMAP.md` و `AGENTS.md` — هر دو فایل با هم در این Slice اولیه (PR #1) تحویل شدند؛ این فهرست اصلاح شد تا با محتوای واقعی Slice هم‌خوان باشد.
- تغییر بعدی باید با وضعیت Repository، Base commit، Scope، تصمیم‌های باز و نتیجه QA همراه باشد.
- محدودیت‌های بالا فقط مخصوص همین Slice مستنداتی هستند؛ قواعد عمومی Git/Repository برای همه Sliceهای آینده در بخش ۲۲.۱ آمده است.
- PR مستنداتی پیشنهادی: `docs: add CPMS marketing and sales website roadmap`

---

## پیوست A — چک‌لیست تحویل به تیم اجرا

پیش از شروع Implementation:

- [ ] Product Truth Inventory/Fact Sheet و فهرست قابلیت‌های قابل انتشار تأیید شده است (یا صریحاً به‌عنوان تأییدنشده/نیازمند شواهد علامت‌گذاری شده است).
- [ ] Persona، Value Proposition و Messaging تأیید شده است.
- [ ] مخاطب اصلی/ثانویه و استراتژی Conversion (دمو/مشاوره) تأیید شده‌اند.
- [ ] الزام Product Truth Inventory با چهار وضعیت `AVAILABLE NOW` / `COMING / ROADMAP` / `CUSTOM / CONTACT SALES` / `NOT CURRENTLY AVAILABLE` تعریف شده است؛ تکمیل آن فقط با شواهد محصول.
- [ ] قواعد محتوا/ادعا (Claim rules) و ممنوعیت Social Proof بدون شواهد پذیرفته شده است.
- [ ] مرجع تصمیم‌گیری و موارد ارجاع به مالک محصول روشن است.
- [ ] Sitemap، URL و Taxonomy تأیید شده است.
- [ ] Design System و RTL rules مستند شده است.
- [ ] Baseline واقعی WordPress/Elementor/Theme/Plugin ثبت شده است.
- [ ] Screenshot، Video و Evidenceهای مجاز ثبت شده‌اند.
- [ ] مدل Pricing و مقصد Demo مشخص شده است یا Unknown صریح دارد.
- [ ] سیاست Privacy، Consent و Retention برای Lead روشن است.
- [ ] ابزار Analytics و Event naming تأیید شده است.
- [ ] معماری Theme بر مبنای شواهد Phase 0 تصمیم‌گیری و ثبت شده است.
- [ ] Performance Budget عددی پس از وجود Baseline مصوب شده است؛ تا آن زمان الزامات کیفی بخش ۱۴ مرجع است.
- [ ] معیارهای Performance، Accessibility و Browser/Device مشخص شده است.
- [ ] Gate A تا D و مالک تأیید هر Gate مشخص شده است.
- [ ] موارد خارج از Scope به تیم منتقل شده است.

## پیوست B — گزارش‌دهی هر Slice

هر PR/گزارش آینده باید حداقل این موارد را اعلام کند:

- هدف Slice؛
- فایل‌ها و Templateهای درگیر؛
- Product facts استفاده‌شده و Source آن‌ها؛
- تغییر IA/SEO/Design/Performance/Security؛
- Responsive و RTL coverage؛
- تست‌های اجراشده و نتیجه؛
- Screenshot یا Preview مربوط به Gate؛
- Known limitation و Open Question؛
- مواردی که عمداً تغییر نکرده‌اند؛
- ارتباط با Definition of Done؛
- Commit SHA دقیقی که شواهد به آن گره خورده است (Exact-SHA Evidence)؛
- بررسی Repository Root، Branch، HEAD، Working Tree، `main` و PR پیش از Write؛
- وضعیت Product Truth هر ادعای جدید بر اساس برچسب‌های `DECIDED` / `REQUIRES PRODUCT VERIFICATION` / `OPEN BUSINESS DECISION` / `DEFERRED UNTIL IMPLEMENTATION/ENVIRONMENT`.
