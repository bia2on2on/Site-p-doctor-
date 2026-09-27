# Product Truth — مرجع زنده واقعیت محصول و کنترل ادعاهای سایت

**وضعیت سند:** زنده (Living) — سند کنترل ادعاهای (Claim-Control) وب‌سایت CPMS

**تاریخ این نسخه:** 2026-09-27 (UTC)

**مربوط به:** `docs/ROADMAP.md` (بخش ۳ — Product Truth Gate) و `AGENTS.md` (بخش‌های Marketing Truth، Implementation Gate و Publication Gate)

**نقش این سند:** تعیین اینکه سایت می‌تواند چه ادعایی درباره محصول CPMS بزند، با تفکیک صریح سه لایه برای هر ادعا/قابلیت:

- **A. VERIFIED CURRENT PRODUCT EVIDENCE** — چه چیزی را شواهد فعلیِ معتبرِ محصول (در SHA ثبت‌شده در بخش ۲) پشتیبانی می‌کند؛
- **B. TARGET LAUNCH PRESENTATION** — معماری و محتوای سایت طوری طراحی می‌شود که پس از تأیید شدن آن قابلیت در محصول Launch، بتواند آن را ارائه دهد؛
- **C. PUBLICATION PERMISSION** — آیا آن عبارت/ادعا **الان** مجاز به عمومی شدن است، **فقط پس از بازتأیید** در Launch Gate، یا **ممنوع**.

### واژگان مجوز انتشار (C)

- **PUBLISHABLE NOW** — اجازه عمومی شدن **الان**؛ فقط از روی شواهد تأییدشده قابل تخصیص است. در Snapshot فعلی **هیچ** موردی در این وضعیت نیست.
- **REVERIFY BEFORE PUBLIC LAUNCH** — فقط پس از بازتأیید در Launch Gate (بخش ۶) مجاز به عمومی شدن است.
- **NOT ALLOWED** — بدون شواهد جدید و بازتأییدشده، ممنوع (فهرست بخش ۴).

### قاعده‌های حاکم

- **معماری سایت شواهد قابلیت محصول نیست.** طراحی فضا/معماری محتوا برای یک قابلیت کاملِ آینده، **مجوز انتشار آن قابلیت به‌عنوان در دسترس فعلی** پیش از تأیید نیست.
- **Target Presentation State** (وضعیت نمایش هدف) و **Current Product Truth** (واقعیت فعلی محصول) دو مفهوم جداگانه‌اند و نباید با هم اشتباه گرفته شوند.
- این سند Living Document است و با مرور زمان به‌روز می‌شود؛ قواعد به‌روزرسانی در بخش ۷.

---

## 1. تصمیم مالک — توسعه موازی و سیاست انتشار (DECIDED)

- وب‌سایت و پلاگین CPMS **به‌صورت موازی** توسعه می‌یابند.
- سایت باید به‌عنوان **وب‌سایت نهایی Marketing/Sales برای محصول CPMS کامل و آماده ارائه (Ready-to-Offer)** معماری، طراحی و در نهایت پیاده‌سازی شود؛ **نه** به‌عنوان سایت Early-Access، Beta، Coming-Soon، اختصاصی برای مشتریان خاص (Selected-Customer)، یا Landing Page موقتی پیش‌از-انتشار.
- **اما سایت تا آمادگی واقعی CPMS نباید عمومی شود.**

### سیاست انتشار تا آمادگی محصول

- سایت فقط در محیط **Development/Staging** باقی می‌ماند؛
- نباید عمداً **Public Launch** شود؛
- نباید عمداً توسط موتورهای جست‌وجو **Index** شود؛
- نباید به‌عنوان محصولی در دسترس عمومی بازاریابی شود؛
- ادعاهای قابلیت‌های ناتمام/تأییدنشده نباید به محیط عمومی نشت کنند.

**محدودیت عمدی:** جزئیات پیاده‌سازی فنی (Noindex، احراز هویت، ابزار و روش) در این سند تعیین **نمی‌شود**؛ فقط الزام ثبت می‌شود. جزئیات پیاده‌سازی متعلق به فاز Environment/Deployment است (DEFERRED UNTIL IMPLEMENTATION/ENVIRONMENT).

### تفکیک دو دروازه: Implementation و Publication

| | Implementation Gate | Publication Gate |
|---|---|---|
| سؤال | آیا مجاز به **ساختن** سایت هستیم؟ | آیا مجاز به **عمومی کردن** سایت هستیم؟ |
| شرط | پذیرش دروازه‌های برنامه‌ریزی/طراحی/فنی سایت (Roadmap بخش ۱۷) | آمادگی Launch محصول + بازتأیید نهایی Product Truth طبق Launch Truth Gate (بخش ۶ این سند) |
| وابستگی به تکمیل کل پلاگین | **نه** — پیاده‌سازی می‌تواند در حین ادامه‌ی توسعه محصول آغاز شود | **بله** — انتشار عمومی بدون آمادگی Launch محصول ممنوع است |

این دو دروازه **مجزا** هستند: عبور از Implementation Gate مجوز Publication نمی‌دهد، و کامل‌شدن خود سایت به‌تنهایی مجوز انتشار عمومی نیست. **این سند هیچ‌یک از دو دروازه را Passed نمی‌کند.**

### جهت تجاری (تأیید مجدد، بدون تغییر)

- «آماده ارائه» بودن محصول به‌معنای **E-commerce، Signup آنی، Checkout عمومی، قیمت عمومی/ثابت یا Self-Service SaaS نیست**؛ این‌ها تصمیم‌های تجاری جداگانه و مستقل هستند (OPEN BUSINESS DECISION).
- Conversion اصلی سایت همچنان **درخواست دمو/مشاوره (Demo/Consultation)** است، مگر با تصمیم بعدی تغییر کند.

---

## 2. Source Provenance — Baseline راستی‌آزمایی Read-Only

| فیلد | مقدار |
|---|---|
| Product Repository | `bia2on2on/doctor` |
| Verified Evidence SHA | `cbf6e975eecc1009497eef861678904d49cbc304` |
| Runtime | **NOT VERIFIED** |
| Production | **NOT VERIFIED** |
| GitHub Tags/Releases در زمان راستی‌آزمایی | **هیچ** |

**این یک Snapshot تاریخی شواهد برای برنامه‌ریزی توسعه موازی است؛ NOT THE FINAL LAUNCH VERIFICATION.**

### قاعده توسعه موازی (به‌روزرسانی)

Main محصول ممکن است در حین ادامه‌ی کار روی سایت تغییر کند. برای همین:

- SHA شواهد در این سند ثبت می‌ماند؛
- یک ادعا فقط زمانی بازتأیید می‌شود که کار سایت به آن ادعا وابستگی مؤثر (Materially) داشته باشد؛
- در Launch Gate یک بازتأیید کامل و اجباری انجام می‌شود؛
- **نیازی نیست پس از هر Commit محصول، کل Product Truth بازنویسی شود.**

---

## 3. خلاصه شواهد محصول در Snapshot (Evidence Summary)

برای هر مورد: A (شواهد فعلی) / B (نمایش هدف Launch) / C (مجوز انتشار). مگر جایی خلاف آن قید شده باشد، C برای همه موارد Snapshot برابر است با **REVERIFY BEFORE PUBLIC LAUNCH**.

| # | قابلیت / Workflow | A. شواهد فعلی (Evidence) | B. نمایش هدف Launch | C. مجوز انتشار |
|---|---|---|---|---|
| 1 | Integrated Appointment → Reception → Visit Workflow | شواهد فنی قوی؛ فاز Reception هنوز Scope گسترده‌ای در حال تکمیل دارد | Workflow یکپارچه کلینیک | REVERIFY BEFORE PUBLIC LAUNCH |
| 2 | Financial Workflow | هزینه‌ها، صورتحساب، ثبت دستی پرداخت، اصلاحات، Void/Refund، رسید، خلاصه مالی. **معادل حسابداری نیست. درگاه پرداخت آنلاین تأییدشده وجود ندارد.** | فقط آنچه محصول Launch واقعاً پشتیبانی می‌کند | REVERIFY BEFORE PUBLIC LAUNCH |
| 3 | Multi-Clinic Architecture | شواهد فنی قوی برای مدل Organization/Clinic/Location، Memberships، Context با Scope و تست‌های Isolation | Positioning چندکلینیکی/چندموقعیتی، در حدی که شواهد Launch هنوز پشتیبانی‌اش کند | REVERIFY BEFORE PUBLIC LAUNCH |
| 4 | Roles / Access | شواهد فنی قوی | همان، پس از تأیید در Launch | REVERIFY BEFORE PUBLIC LAUNCH |
| 5 | Clinic/Organization Data Separation | شواهد فنی قوی برای مکانیسم‌های Scoped. **هرگز نباید به ادعای گواهی/Compliance تبدیل شود.** | همان، پس از تأیید (بدون ادعای گواهی) | REVERIFY BEFORE PUBLIC LAUNCH |
| 6 | Medical-Data Access Controls | شواهد قوی در سطح مکانیسم. **هرگز از زبان مطلق امنیت استفاده نشود.** | همان، پس از تأیید (بدون ادعای مطلق) | REVERIFY BEFORE PUBLIC LAUNCH |
| 7 | Patient Portal | شواهد فنی در محدوده (Bounded) برای Profile، Visits، Prescriptions و Files | همان، در حد شواهد Launch | REVERIFY BEFORE PUBLIC LAUNCH |
| 8 | Doctor Portal / Workspace | شواهد فنی قوی و Bounded | همان، پس از تأیید در Launch | REVERIFY BEFORE PUBLIC LAUNCH |
| 9 | Reception / Secretary Workflow | Check-in، Walk-in، Arrival Board و شواهد مرتبط با صف. **فاز کامل Reception در زمان Snapshot بسته نشده بود.** | همان، پس از بسته‌شدن و تأیید فاز کامل | REVERIFY BEFORE PUBLIC LAUNCH |
| 10 | Patient Records | شواهد فنی قوی | همان، پس از تأیید در Launch | REVERIFY BEFORE PUBLIC LAUNCH |
| 11 | Prescriptions / Documents | شواهد فنی Bounded. **ادعای اتصال به نسخه الکترونیک ملی ایران از این Snapshot ممنوع است.** | همان، در حد شواهد Launch | REVERIFY BEFORE PUBLIC LAUNCH |
| 12 | Queue / Waiting Workflow | شواهد فنی قوی | همان، پس از تأیید در Launch | REVERIFY BEFORE PUBLIC LAUNCH |

### موارد تکمیلی (مختصر)

همه با همان Provenance (بخش ۲) و مجوز انتشار **REVERIFY BEFORE PUBLIC LAUNCH**:

- **Appointment / Public Booking:** شواهد فنی برای مکانیسم نوبت‌دهی در Snapshot ثبت شده است؛ Public Booking به‌عنوان قابلیت مستقلِ عمومی، از این Snapshot جداگانه تأیید نشده است.
- **Internal Notifications:** در Snapshot ثبت شده؛ Scope و رفتار آن برای ادعای عمومی بازتأیید می‌خواهد.
- **SMS:** **Provider-dependent** — وابسته به پیکربندی Provider خارجی SMS؛ بدون شواهد جدید، «باندل‌شده» یا «فعال به‌صورت پیش‌فرض» ادعا نمی‌شود.
- **Email:** **Configuration-dependent** — وابسته به پیکربندی سرور/محیط.
- **Reporting:** در Snapshot ثبت شده؛ Scope دقیق برای ادعای عمومی بازتأیید می‌خواهد.
- **WordPress Plugin Environment:** CPMS یک افزونه WordPress است (محیط افزونه WordPress)؛ رفتار Runtime/Production در این Snapshot **NOT VERIFIED** است.

---

## 4. فهرست ممنوعه — بدون شواهد جدید ادعا نشود (DO-NOT-CLAIM)

تا شواهد جدید و بازتأییدشده وجود نداشته باشد، هیچ‌یک از موارد زیر در هیچ متن عمومی سایت مجاز نیست:

- درگاه پرداخت آنلاین (Online Payment Gateway)؛
- حسابداری کامل / دفاتر عمومی (Full Accounting / General Ledger)؛
- اتصال به بیمه (Insurance Integration)؛
- اتصال به نسخه الکترونیک ملی ایران (Iranian National E-Prescription)؛
- Mobile App؛
- Push Notification؛
- ادعاهای AI-Powered برای محصول؛
- انطباق قانونی (Regulatory Compliance)؛
- گواهی امنیتی (Security Certification)؛
- تضمین Uptime/SLA/Performance؛
- پشتیبانی 24/7؛
- تعداد مشتری (Customer Counts)؛
- Testimonial/Logo بدون اجازه و شواهد واقعی؛
- قیمت/بسته عمومی (Public Prices/Packages)؛
- Provider SMS ایران به‌عنوان باندل‌شده (Bundled Iranian SMS Provider)؛
- هر رفتار Production که تأیید نشده است.

---

## 5. Placeholderهای قابلیت هدف (Target Capability Placeholders)

معماری سایت می‌تواند برای یک قابلیت هدف (Intended Capability) یک بخش/صفحه/کامپوننت آینده رزرو کند، با این شروط:

- Placeholder باید به‌صورت داخلی قابل شناسایی باشد: **TARGET — NOT PUBLICATION-APPROVED**؛
- هرگز نباید به شکل قابلیت تأییدشده جلوه کند (نه در نام، نه در Draft، نه در Preview)؛
- Placeholder ساختگی برای قابلیتی که **نه مالک محصول و نه Roadmap محصول** از آن حمایت نمی‌کنند، **ممنوع** است.

---

## 6. Launch Truth Gate — دروازه حقیقت انتشار

پیش از Public Launch سایت، **هر هشت** گام زیر باید انجام و مستند شود:

1. شناسایی دقیق کاندید/نسخه Launch محصول (SHA/Version دقیق)؛
2. بازسازی/بازتأیید کامل Product Truth بر مبنای همان کاندید؛
3. بررسی شواهد Runtime برای Workflowهای Marketing-critical، تا حد امکان؛
4. راستی‌آزمایی Screenshot/Video واقعی با محصول Launch؛
5. حذف یا بازنویسی هر Placeholder تأییدنشده؛
6. Audit Placeholder/ساختگی (Placeholder/Fabrication Audit)؛
7. تأیید نهایی حقایق Support/Commercial/Price/Contact با Product Owner؛
8. و فقط بعد از آن، تأیید متن عمومی Capabilityها.

**هیچ Snapshot فعلی به‌طور خودکار این گیت را Pass نمی‌کند.** Snapshot بخش ۲ صرفاً یک شواهد برنامه‌ریزی برای توسعه موازی است، نه تأیید Launch.

---

## 7. قواعد به‌روزرسانی این سند (Living Document)

- زمان‌های به‌روزرسانی: (a) وابستگی مؤثر (Materially) کار سایت به یک ادعا؛ (b) تغییر مادی محصول که ادعای ثبت‌شده را تحت‌تأثیر می‌گذارد؛ (c) عبور از Launch Gate؛
- هر به‌روزرسانی باید شامل: تاریخ، محرک به‌روزرسانی، SHA/منبع شواهد جدید و فهرست ادعاهای متأثر باشد؛
- بازنویسی کامل پس از هر Commit محصول لازم **نیست** (بخش ۲)؛
- هر تغییر مجوز انتشار یک ادعا باید مستند و قابل بازبینی باشد؛
- این سند مرجع Claim Control سایت است؛ جای Product Truth Gate (Roadmap بخش ۳) را نمی‌گیرد و با هم اعمال می‌شوند.

### Change Log

| تاریخ (UTC) | محرک | خلاصه |
|---|---|---|
| 2026-09-27 | تصمیم مالک درباره توسعه موازی سایت/محصول و Launch Truth Gate | اولین نسخه: ثبت Baseline شواهد Read-Only (SHA `cbf6e975eecc1009497eef861678904d49cbc304`، Runtime/Production NOT VERIFIED)، خلاصه ۱۲ مورد شواهد + موارد تکمیلی، فهرست ممنوعه، قواعد Placeholder، Launch Truth Gate و قاعده به‌روزرسانی در توسعه موازی |
