<div align="center" dir="rtl">

# 🎓 سامانه جامع زمان‌بندی، انتخاب واحد و برنامه‌ریزی درسی سس (SESS)

**پلتفرم مدرن و سازمانی شبیه‌سازی تقویم هفتگی و موتور ریاضی تشخیص تداخل کلاس‌ها و امتحانات دانشگاهی**  
*طراحی‌شده ویژه پورتال‌های دانشگاه شیراز و دانشگاه شهرکرد • پیاده‌سازی بر پایه معماری Core-First Monorepo*

[![License: MIT](https://img.shields.io/badge/مجوز-MIT-8c57ff.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Turborepo](https://img.shields.io/badge/مونوریپو-Turborepo-ef4444.svg?style=for-the-badge&logo=turborepo)](https://turbo.build/repo)
[![pnpm](https://img.shields.io/badge/pnpm-v11-f69220.svg?style=for-the-badge&logo=pnpm)](https://pnpm.io/)
[![Vue 3.5](https://img.shields.io/badge/Vue-3.5%20Composition%20API-42b883.svg?style=for-the-badge&logo=vuedotjs)](https://vuejs.org/)
[![Vite 6](https://img.shields.io/badge/Vite-6.0-646cff.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Vuetify 3](https://img.shields.io/badge/Vuetify-3.7%20Material%20Design%203-1867c0.svg?style=for-the-badge&logo=vuetify)](https://vuetifyjs.com/)
[![Pinia](https://img.shields.io/badge/Pinia-2.3-ffd859.svg?style=for-the-badge&logo=vuedotjs)](https://pinia.vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/محاسبات%20لبه-Cloudflare%20Workers-f38020.svg?style=for-the-badge&logo=cloudflare)](https://workers.cloudflare.com/)
[![Playwright](https://img.shields.io/badge/E2E-Playwright%201.49-45ba4b.svg?style=for-the-badge&logo=playwright)](https://playwright.dev/)

<br />

[English Documentation](./README.md) • [راهنمای فارسی](./README.fa.md) • [پورتال مستندات فنی و تعاملی (VitePress)](https://github.com/rashcode-com/Sess-Timetabling-App)

</div>

---

## 🌟 خلاصه اجرایی و صورت مسئله (Problem Space)

فرآیند انتخاب واحد در پورتال‌های دانشگاهی مبتنی بر سامانه سنتی **سس (SESS)** همواره با چالش‌ها و خطاهای انسانی پرهزینه‌ای برای دانشجویان و کارشناسان آموزشی همراه است:

- **پیچیدگی تداخل‌های چندبخشی**: اخذ دروس از دانشکده‌های مختلف اغلب منجر به همپوشانی ناخواسته ساعات کلاس در روزهای یکسان می‌شود.
- **تداخل تقویم امتحانات پایان‌ترم**: همزمانی آزمون‌های پایانی در یک روز و ساعت مشخص، دانشجو را در میانه نیم‌سال ناچار به حذف اضطراری درس می‌کند.
- **فاصله فیزیکی ساختمان‌های آموزشی**: برگزاری کلاس‌ها در پردیس‌ها یا دانشکده‌های با فاصله زیاد و بازه زمانی ناکافی برای جابجایی.
- **دسترسی ایستا و جدول‌های سنتی**: ساختار سنتی پرتال فاقد جستجوی لحظه‌ای، فیلترهای هوشمند و شبیه‌ساز گرافیکی تقویم هفتگی است.

**Sess-Timetabling-App** یک پاسخ مهندسی کامل و مدرن به این چالش‌هاست. این سامانه با اتکا به **معماری Core-First Monorepo** داده‌های درسی را به‌صورت خودکار استخراج، نرمال‌سازی و اعتبارسنجی کرده و با پیاده‌سازی موتورهای محاسباتی تداخل و رابط کاربری تک‌صفحه‌ای (SPA) واکنشی، سرعت پاسخ‌دهی را به نزدیک صفر رسانده است.

---

## 📸 گالری تصاویر و رابط کاربری (Visual Showcase)

رابط کاربری مدرن سامانه با استفاده از **Vue 3.5**، **Vuetify 3.7 (Material Design 3)** و قلم اصیل **وزیرمتن (Vazirmatn FD)** بازطراحی شده و شامل چیدمان کاملاً راست‌به‌چپ (RTL)، طراحی واکنش‌گرا و تم‌های روشن و تاریک است:

| **۱. جستجوی پیشرفته و دراور فیلترها** | **۲. مشخصات تکمیلی و ظرفیت دروس** |
| :---: | :---: |
| [![جستجوی پیشرفته و دراور فیلترها](./apps/docs/public/screenshots/01-course-search-table.png)](./apps/docs/public/screenshots/01-course-search-table.png) | [![مشخصات تکمیلی و ظرفیت دروس](./apps/docs/public/screenshots/02-course-expanded-details.png)](./apps/docs/public/screenshots/02-course-expanded-details.png) |
| *فیلترهای همزمان بر اساس دانشکده، استاد، زمان و مکان کلاس با نتایج بلادرنگ و چیپ‌های واکنشی* | *ردیف‌های بازشونده جدول شامل تعداد واحد، ظرفیت کل، تاریخ امتحان و مشخصات گروه* |

| **۳. تقویم هفتگی شنبه تا جمعه** | **۴. مودال جزئیات درس و سبد انتخاب واحد** |
| :---: | :---: |
| [![تقویم هفتگی شنبه تا جمعه](./apps/docs/public/screenshots/03-weekly-calendar-schedule.png)](./apps/docs/public/screenshots/03-weekly-calendar-schedule.png) | [![مودال جزئیات درس و سبد انتخاب واحد](./apps/docs/public/screenshots/04-course-detail-modal.png)](./apps/docs/public/screenshots/04-course-detail-modal.png) |
| *نمایش زمان‌بندی هفتگی با رنگ‌بندی تفکیک‌شده و محاسبه هوشمند بازه‌های زمانی کلاس‌ها* | *مشاهده مشخصات کامل درس و تب جانبی محاسبه آنلاین مجموع واحدهای انتخابی* |

<div align="center">

### ۵. موتور تشخیص هوشمند تداخل دروس و امتحانات
[![تشخیص هوشمند تداخل دروس](./apps/docs/public/screenshots/05-clash-detection-modal.png)](./apps/docs/public/screenshots/05-clash-detection-modal.png)
*هشدار شناور و مودال مقایسه ستونی تداخل ساعات کلاسی و امتحانات پایان‌ترم در زمان واقعی*

</div>

---

## 🏛️ معماری Core-First در مونوریپو

در این سامانه اصل بنیادی **Core-First** حاکم است: منطق بیزینس، الگوریتم‌های زمانی، توابع نرمال‌سازی و اسکیماهای اعتبارسنجی کاملاً مستقل از لایه‌های ورودی/خروجی، فریم‌ورک‌های وب و ران‌تایم‌های سرور طراحی شده‌اند.

| مرحله چرخه داده | ماژول / کامپوننت | ورودی و خروجی داده | فناوری محوری |
| :--- | :--- | :--- | :--- |
| **۱. واکشی از پورتال** | 🏛️ سامانه آموزشی سس | استخراج جداول خام دروس از دانشگاه شیراز و شهرکرد | سشن‌های وب پورتال |
| **۲. استخراج و پارس** | 🕷️ ماژول `@sess/crawler` | موتور کرومیوم Playwright ➔ نرمال‌سازی متون فارسی (`parser.ts`) | Playwright Chromium و ویزارد CLI |
| **۳. همگام‌سازی ابری** | ⚡ ماژول `@sess/api` | ارسال امن `POST /api/sync` ➔ ذخیره‌سازی در Cloudflare KV (`semester_data`) | گیت‌وی Hono.js و احراز هویت بدون کانال جانبی |
| **۴. ذخیره محلی آفلاین** | 📁 `packages/data/` | مخزن کانونیکال داده (`data.json`) و انتشار در دارایی‌های استاتیک وب (`public/data/`) | دیتابیس استاتیک JSON |
| **۵. برنامه‌ریزی کلاینت** | 💻 وب‌اپلیکیشن `@sess/web` | فرانت‌اند مدرن Vue 3.5 ➔ جدول هفتگی شنبه تا جمعه و جستجوی آنی | Vue 3.5، Vuetify 3.7 و Pinia 2 |
| **۶. هسته محاسباتی خالص** | 🧠 هسته `@sess/core` | اسکیماهای سراسری Zod و موتور ریاضی حل تداخل زمانی | تایپ‌اسکریپت خالص بدون وابستگی |

##### 🔗 چرخه حیات داده در سامانه:
۱. **استخراج داده (Extraction)**: خزنده `@sess/crawler` جداول هفتگی را از پورتال‌های سس واکشی کرده، ارقام و حروف فارسی را یکدست نموده و با اسکیماهای Zod هسته تطبیق می‌دهد.
۲. **توزیع و ذخیره‌سازی (Distribution)**:
   - **مسیر لبه ابری (Edge KV)**: داده‌های تایید شده با توکن امنیتی به اندپوینت `POST /api/sync` ارسال و در Cloudflare KV کش می‌شوند.
   - **مسیر دیسک محلی (Local JSON)**: خزنده فایل `data.json` را در پکیج `@sess/data` ثبت کرده و به صورت خودکار به دارایی‌های استاتیک کلاینت (`apps/web/public/data/`) همگام‌سازی می‌شود تا کلاینت بدون نیاز به سرور و به شکل آفلاین اجرا شود.
۳. **رندر و تعامل (Presentation)**: وب‌اپلیکیشن `@sess/web` با ایندکس سریع حافظه، جستجوی بلادرنگ در جدول دروس، نمایش تقویم هفتگی و هشدار هوشمند تداخل‌ها را در اختیار دانشجو قرار می‌دهد.

### ساختار ورک‌اسپیس‌ها و پکیج‌ها

مخزن با استفاده از **pnpm workspaces** سازماندهی شده و تسک‌های ساخت موازی توسط **Turborepo** هدایت می‌شوند:

```text
Sess-Timetabling-App/
├── apps/
│   ├── web/               # @sess/web — وب‌اپلیکیشن مدرن Vue 3.5 + Vite 6 + Vuetify 3.7 + Pinia 2
│   └── docs/              # @sess/docs — پرتال مستندات فنی VitePress 1.6 دو زبانه (فارسی و انگلیسی)
├── packages/
│   ├── core/              # @sess/core — هسته محاسباتی، اسکیماهای Zod و موتور تداخل زمانی
│   └── api/               # @sess/api — گیت‌وی پرسرعت Hono.js (Cloudflare Workers و Node.js)
├── services/
│   ├── crawler/           # @sess/crawler — سرویس خزنده Playwright با ویزارد تعاملی خط فرمان
│   └── e2e/               # @sess/e2e — سوئیت تست‌های رگرسیون بصری و سنجش خط مبنا
├── server.js              # سرور آماده پروداکشن Node.js با پشتیبانی از SPA Fallback
├── turbo.json             # خط‌لوله ساخت و کش هوشمند توربوریپو
└── pnpm-workspace.yaml    # پیکربندی ورک‌اسپیس‌ها
```

| ورک‌اسپیس | نام پکیج | نقش و مسئولیت در معماری | استک اصلی |
| :--- | :--- | :--- | :--- |
| `packages/core` | `@sess/core` | مدل‌های دامنه، اسکیماهای Zod، توابع نرمال‌سازی و موتور ریاضی تشخیص تداخل | TypeScript 5.7, Zod 3, tsup |
| `packages/api` | `@sess/api` | گیت‌وی لبه با زمان پاسخ زیر ۱۰ میلی‌ثانیه، آداپتور ذخیره‌سازی ابری KV و محلی | Hono.js, Cloudflare Workers, Node.js |
| `apps/web` | `@sess/web` | وب‌اپلیکیشن کلاینت، تقویم هفتگی شنبه تا جمعه، جستجوی $O(1)$ و هشدارهای تداخل | Vue 3.5, Vuetify 3.7, Pinia 2, Vite 6 |
| `services/crawler` | `@sess/crawler` | خزنده مقاوم پورتال شیراز و شهرکرد، پارسر ساخت‌یافته و ارسال به API | Playwright, Commander, @clack/prompts |
| `services/e2e` | `@sess/e2e` | سپر ایمنی بصری و ثبت اسنپ‌شات‌های مبنا از ۵ سناریوی کلیدی کاربر | Playwright, Edge/Chromium |
| `apps/docs` | `@sess/docs` | پرتال جامع مستندات دو زبانه (فارسی راست‌چین `/` و انگلیسی چپ‌چین `/en/`) | VitePress 1.6, Vue 3, Mermaid |

---

## 📦 چکیده جامع ماژول‌ها و پکیج‌ها (Documentation Digest)

این بخش چکیده جامعی از کلیه مستندات فنی موجود در پرتال Docs و پکیج‌های مونو‌ریپو را ارائه می‌دهد.

### ۱. هسته پردازشی بدون وابستگی (`@sess/core`)

پکیج مرکزی و قلب محاسباتی مونو‌ریپو با تارگت **ES2020** که با استفاده از `tsup` به صورت دوگانه **ESM** (`.mjs`) و **CommonJS** (`.js`) بیلد می‌شود و هیچ وابستگی اجرایی به جز کتابخانه Zod ندارد.

#### اسکیماهای اعتبارسنجی دامنه (`src/schemas/`)
* **`TimeSlotSchema` (`TimeSlot`)**: مدل هر اسلات کلاسی در طول هفته:  
  `{ place: string, day: string, startHour: number, startMinute: number, endHour: number, endMinute: number }`
* **`FinalTimeSplitSchema` (`FinalTimeSplit`)**: ساختار تفکیک‌شده ساعت آزمون پایان‌ترم:  
  `{ start_hour: number, start_minute: number, end_hour: number, end_minute: number }`
* **`FinalDateSplitSchema` (`FinalDateSplit`)**: تاریخ هجری شمسی آزمون پایانی:  
  `{ d: number, m: number, y: number }`
* **`CourseSchema` (`Course`)**: ساختار اتمیک یک درس در سامانه سس شامل کد ترکیبی، عنوان درس، تعداد واحد، نام استاد، ظرفیت، اسلات‌های زمانی، مشخصات امتحان و پیش‌نیازها.
* **`SemesterDataSchema` (`SemesterData`)**: دیکشنری تو در توی کاتالوگ درسی ترم به تفکیک دانشکده:  
  `Record<DepartmentName, Record<CourseCompositeId, Course>>`

#### موتورهای ریاضی تشخیص تداخل (`src/helpers/timeInterference.ts`)
* **تداخل کلاس‌ها در هفته**: دو درس در صورتی تداخل دارند که در روزی یکسان، بازه‌های زمانی آن‌ها همپوشانی داشته باشد:
  $$\text{Class Conflict} = (\text{Day}_1 = \text{Day}_2) \land \Big( (S_1 < E_2 \land E_1 > S_2) \lor (S_1 \le S_2 \land E_1 \ge E_2) \Big)$$
* **تداخل امتحانات پایان‌ترم**: تطابق دقیق روز و بازه ساعتی آزمون‌ها با در نظر گرفتن هوشمند موارد بدون تاریخ (`00:00 - 00:00`).

#### توابع نرمال‌سازی متون و ارقام (`src/helpers/normalizers.ts`)
* **`arabicToPersian`**: تبدیل خودکار حروف عربی (`ك` به `ک`، `ي` به `ی`) و ارقام عربی (`١...٩` به `۱...۹`).
* **`toFarsiNumber` / `convertPersianNumToEng`**: تبدیل دوسویه بین ارقام انگلیسی و فارسی با عملیات سریع کد اسکی بدون جهش حافظه.
* **`normalizeDayName`**: استانداردسازی نام روزهای هفته با رعایت نیم‌فاصله (مانند `یک‌شنبه` و `چهارشنبه`).
* **`teacherNameDivider`**: تبدیل قالب سنتی سامانه (`فامیلی*نام*دانشکده*`) به نام استاندارد (`نام فامیلی`).

---

### ۲. وب‌اپلیکیشن فیچر-محور (`@sess/web`)

فرانت‌اند مدرن SPA طراحی‌شده با **Vue 3.5**, **Composition API (`<script setup lang="ts">`)** و **Vuetify 3.7**.

```mermaid
graph TD
    subgraph UIModule ["لایه‌های رابط کاربری و صفحات"]
        App["App.vue (شل اصلی و پوسته RTL)"]
        Home["Home.vue (ارکستریتور و صفحه اصلی)"]
    end

    subgraph FeatureSlices ["ماژول‌های فیچر-محور (Features)"]
        Courses["features/courses (جدول داده و دیالوگ جزئیات)"]
        Filters["features/filters (دراور فیلترهای چندگانه)"]
        Timetable["features/timetable (تقویم هفتگی، سبد و هشدارهای تداخل)"]
    end

    subgraph CoreServices ["سرویس‌ها و وضعیت سراسری (State & Services)"]
        ETL["shared/services/courseDataService.ts (خط لوله تبدیل و جستجو)"]
        CourseStore["store/courseStore.ts (کاتالوگ داده و ایندکس Map)"]
        TimetableStore["store/timetableStore.ts (دروس انتخابی و گترهای واکنشی تداخل)"]
    end

    App --> Home
    Home --> Courses
    Home --> Filters
    Home --> Timetable
    Courses --> CourseStore
    Filters --> CourseStore
    Timetable --> TimetableStore
    CourseStore --> ETL
    TimetableStore --> ETL
```

#### الگوهای معماری پیاده‌سازی‌شده:
* **Feature-First Modularity**: ماژول‌ها در برش‌های دامنه‌ای (`src/features/courses/`, `src/features/filters/`, `src/features/timetable/`) ایزوله شده‌اند و ارتباطات تنها از طریق فایل `index.ts` هر ماژول مجاز است.
* **استورهای دامنه‌محور Pinia 2**:
  - `useCourseStore`: بارگذاری کاتالوگ ترم، تولید ایندکس جستجوی آنی با پیچیدگی زمانی $O(1)$ از طریق `Map<string, Course>` و ارائه‌دهنده آیتم‌های فیلتر بدون موارد تکراری.
  - `useTimetableStore`: نگهداری سبد دروس با پایداری خودکار در `localStorage` از طریق پلاگین `pinia-plugin-persistedstate`. محاسبه گترهای واکنشی تداخل‌ها (`classTimeConflicts`, `finalExamConflicts`, `vahedsSum`) بدون نیاز به واچرهای سنگین $O(N^2)$.
* **خط لوله تبدیل خالص داده‌ها (`courseDataService.ts`)**: اجرای تمامی فیلترها، جستجوهای چندگانه و نرمال‌سازی‌ها بدون ایجاد جهش (Mutation) در دیتای خام منبع.
* **رندر سه‌وضعیتی نتایج جستجو (Tri-State Rendering)**:
  1. `results.length > 0 && results[0] !== -1`: رندر ردیف‌های جدول دروس یافت‌شده.
  2. `results[0] === -1`: رندر وضعیت اختصاصی «موردی پیدا نشد» با دکمه بازنشانی.
  3. آرایه خالی: رندر وضعیت اولیه خوش‌آمدگویی و راهنمای فیلترها.
* **سیستم طراحی Materio و تایپوگرافی اصیل**: توکن‌های متریال دیزاین ۳، سوییچ روان تم تیره/روشن و فونت‌های وب‌فونت رسمی وزیرمتن با تمامی وزن‌های ۳۰۰ تا ۸۰۰.

---

### ۳. گیت‌وی محاسبات لبه (`@sess/api`)

گیت‌وی REST فوق‌سریع و سبک مبتنی بر **Hono.js** که برای اجرای بدون سربار روی شبکه‌های لبه و کانتینرهای مستقل توسعه یافته است.

#### آداپتور ذخیره‌سازی جامع (`src/storage.ts`)
این لایه به صورت پویا ران‌تایم جاری را تشخیص می‌دهد:
- **Cloudflare Workers (لبه ابری)**: خواندن و نوشتن مستقیم در **Cloudflare KV** (`DATA_KV`) با زمان پاسخ زیر ۱۰ میلی‌ثانیه.
- **Node.js (سرور اختصاصی / داکر)**: خواندن از فایل محلی دیسک (`data.json`).
- **Isolate Cache**: در هر دو محیط، کش حافظه موقت با زمان انقضای ۶۰ ثانیه فعال است تا عملیات I/O به حداقل برسد.

#### حل‌کننده مسیر آبشاری چندلایه‌ای (`src/paths.ts`)
جهت سازگاری با انواع محیط‌های استقرار (توسعه مونوریپو، رانر مستقل سرور و داکر)، مسیر فایل‌های استاتیک فرانت‌اند (`apps/web/dist`) و دیتا از طریق یک آبشار الگوریتمی قطعی کشف می‌شود:
1. متغیرهای محیطی با اولویت بالا (`WEB_DIST_PATH` و `DATA_FILE_PATH`).
2. نشانگرهای ریشه ورک‌اسپیس (`pnpm-workspace.yaml` و `turbo.json`).
3. مسیر دایرکتوری جاری و ماژول فرعی.

#### امنیت تحلیل زمانی ثابت (Timing-Safe)
اندپوینت حساس همگام‌سازی داده‌ها (`POST /api/sync`) با استفاده از توابع رمزنگاری استاندارد Web Crypto و هش SHA-256 اعتبارسنجی شده و با الگوریتم مقاوم در برابر حملات تحلیل زمانی (`timingSafeEqual`) بررسی می‌شود.

---

### ۴. پایپ‌لاین اتوماسیون و استخراج داده (`@sess/crawler`)

سرویس استخراج خودکار و خزنده مقاوم مبتنی بر **Playwright** و **TypeScript** ویژه پورتال‌های دانشگاهی سس:

* **کلیک‌های تاب‌آور (`safeClick`)**: ترکیب کلیک‌های مرورگر Playwright با دیپچرهای بومی جاوااسکریپت در DOM که خطاهای المنت‌های منقضی (Stale Elements) را در منوهای کشویی وابسته دانشگاه خنثی می‌کند.
* **بازگشت نمایی ۳ مرحله‌ای (Exponential Backoff)**: تاب‌آوری کامل در برابر کندی شبکه دانشگاه، تایم‌اوت پورتال و قطعی‌های لحظه‌ای.
* **ویزارد تعاملی خط فرمان (`prompt.ts`)**: رابط ترمینال زیبا با `@clack/prompts` برای انتخاب راحت نیم‌سال، مشاهده دانشکده‌ها و انتخاب مقصد خروجی.
* **سینک مستقیم ابری**: با پرچم `--sync`، دیتای استخراج‌شده طبق اسکیماهای `@sess/core` اعتبارسنجی شده و مستقیماً به اندپوینت `POST /api/sync` در کلودفلر یا سرور ارسال می‌گردد.

---

### ۵. خط مبنای تست‌های رگرسیون بصری (`@sess/e2e`)

سوئیت اتوماسیون Playwright برای تضمین پایداری کامل رابط کاربری، جلوگیری از به‌هم‌ریختگی‌های چیدمان و شکست‌های استایل در زبان RTL:

* **سناریوی ۱**: فیلتر و جستجوی دسکتاپ، صفحه‌بندی جدول و چیپ‌های آماری (`01_search_results_desktop`).
* **سناریوی ۲**: تقویم هفتگی شنبه تا جمعه و پاپ‌اور مشخصات اسلات‌ها (`02_calendar_schedule`).
* **سناریوی ۳**: هشدار شناور تداخل و مودال مقایسه ستونی تداخلات (`03_clash_snackbar_and_modal`).
* **سناریوی ۴**: دیالوگ مشخصات کامل درس و ظرفیت‌ها (`04_course_details_modal`).
* **سناریوی ۵**: واکنش‌گرایی در نمایشگرهای کوچک موبایل ۳۷۵ پیکسلی (`05_mobile_drawer`, `05_mobile_table_stacked`).

---

### ۶. پرتال جامع مستندات فنی (`@sess/docs`)

پرتال فنی توسعه‌یافته با **VitePress 1.6** و **Vue 3**:
* **فارسی پیش‌فرض در مسیر روت (`/`)**: پیکربندی راست‌به‌چپ (RTL)، تایپوگرافی اصیل وزیرمتن و نوبار بومی.
* **نسخه انگلیسی کامل در مسیر (`/en/`)**: معادل کامل مستندات به زبان انگلیسی با دکمه تغییر زبان.
* **دیاگرام‌های تعاملی Mermaid**: دارای دکمه‌های زوم، جابجایی (Pan)، تناسب با صفحه و حالت تمام‌صفحه.
* **موتور جستجوی محلی**: جستجوی آنی در مرورگر با پشتیبانی کامل از کلمات فارسی و انگلیسی.

---

## 📡 مستندات کامل اندپوینت‌های REST API

کلیه مسیرها تحت پیش‌وند `/api` در دسترس هستند:

| متد | اندپوینت | شرح عملکرد | احراز هویت |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | بررسی وضعیت سلامت سرور، نوع ران‌تایم جاری و نسخه | نیازی ندارد |
| `GET` | `/api/departments` | بازگرداندن فهرست تمام دانشکده‌های موجود در کاتالوگ | نیازی ندارد |
| `GET` | `/api/courses` | فیلتر و جستجوی دروس بر اساس `department`، `query`، `teacher`، `day` و `limit` | نیازی ندارد |
| `GET` | `/api/courses/:id` | دریافت مشخصات کامل یک درس با شناسه ترکیبی | نیازی ندارد |
| `POST` | `/api/sync` | ارسال کل کاتالوگ استخراج‌شده ترم (`SemesterDataSchema`) | توکن Bearer یا `X-Sync-Token` |

### نمونه درخواست‌ها و پاسخ‌ها

#### بررسی وضعیت سلامت سرور (`GET /api/health`)
```http
GET /api/health HTTP/1.1
```
```json
{
  "status": "ok",
  "runtime": "cloudflare-workers",
  "timestamp": "2026-09-10T12:00:00.000Z",
  "version": "0.1.0"
}
```

#### جستجوی دروس (`GET /api/courses?department=کامپیوتر&limit=2`)
```http
GET /api/courses?department=کامپیوتر&limit=2 HTTP/1.1
```
```json
{
  "count": 2,
  "courses": [
    {
      "id": "290331041^1",
      "course": "برنامه نویسی پیشرفته ۲",
      "vahed": 3,
      "teacher": "خیام صالحی",
      "group": "گروه ۱",
      "faculty": "دانشکده علوم ریاضی",
      "department": "بخش مهندسی کامپیوتر و فناوری اطلاعات",
      "capacity": 40,
      "final": "۱۴۰۵/۰۳/۲۵ (۱۰:۳۰ - ۱۲:۳۰)",
      "classes": [
        { "day": "شنبه", "place": "سایت کامپیوتر ۲۰۱", "startHour": 13, "startMinute": 30, "endHour": 14, "endMinute": 30 },
        { "day": "یک‌شنبه", "place": "کلاس ۲۰۱", "startHour": 8, "startMinute": 30, "endHour": 10, "endMinute": 30 }
      ]
    }
  ]
}
```

#### همگام‌سازی دیتا (`POST /api/sync`)
```http
POST /api/sync HTTP/1.1
Authorization: Bearer your_strong_secret_token
Content-Type: application/json

{
  "بخش مهندسی کامپیوتر": {
    "290331041^1": { /* آبجکت درس */ }
  }
}
```
```json
{
  "success": true,
  "message": "Semester dataset synced successfully",
  "stats": {
    "departments": 35,
    "courses": 1420,
    "timestamp": "2026-09-10T12:00:00.000Z"
  }
}
```

---

## ⚙️ متغیرهای محیطی و پیکربندی

| متغیر | محل تنظیم | هدف و کاربرد | مقدار پیش‌فرض |
| :--- | :--- | :--- | :--- |
| `PORT` | رانر سرور / `.env` | پورت شنود HTTP برای اجرای یکپارچه | `3000` |
| `SYNC_TOKEN` | متغیرهای API / `.dev.vars` | کلید محرمانه ایمن برای اعتبارسنجی اندپوینت `POST /api/sync` | *در پروداکشن الزامی* |
| `WEB_DIST_PATH` | متغیرهای API / `.env` | مسیر پوشه فایل‌های استاتیک کامپایل‌شده فرانت‌اند | تشخیص خودکار |
| `DATA_FILE_PATH` | متغیرهای API / `.env` | مسیر فایل محلی کاتالوگ دروس `data.json` | تشخیص خودکار |
| `SESS_URL` | خزنده / `.env` | آدرس پرتال دانشگاه سس (مثال: `https://sess.sku.ac.ir/`) | *الزامی* |
| `SESS_USERNAME` | خزنده / `.env` | شماره دانشجویی یا نام کاربری پرتال سس | *الزامی* |
| `SESS_PASSWORD` | خزنده / `.env` | رمز عبور ورود به پورتال آموزشی دانشگاه | *الزامی* |
| `SEMESTER_VALUE` | خزنده / `.env` | کد ترم تحصیلی مورد نظر (مثال: `4031`) | اختیاری |
| `HEADLESS` | خزنده / `.env` | اجرای پس‌زمینه بدون پنجره مرورگر (`true` یا `false`) | `true` |

---

## 🚀 راهنمای شروع سریع و دستورات توسعه

### پیش‌نیازها
* **Node.js**: نسخه `v20.x` یا بالاتر (نسخه LTS توصیه می‌شود)
* **pnpm**: نسخه `v11.x` یا بالاتر (`corepack enable pnpm`)
* **Git**

### ۱. نصب وابستگی‌ها
```bash
# کلون پروژه از گیت‌هاب
git clone https://github.com/rashcode-com/Sess-Timetabling-App.git
cd Sess-Timetabling-App

# نصب تمامی پکیج‌های مونو‌ریپو
pnpm install
```

### ۲. اجرای سرویس‌ها در حالت توسعه
```bash
# اجرای همزمان تمامی سرویس‌ها با خط لوله موازی Turborepo
pnpm dev

# --- یا اجرای مستقل هر بخش ---

# وب‌اپلیکیشن Vue 3 (آدرس http://localhost:8081)
pnpm web:serve

# شبیه‌ساز لبه Cloudflare Wrangler (آدرس http://localhost:8787)
pnpm api:dev
# یا اجرای مستقیم API روی Node.js:
pnpm --filter @sess/api dev:node

# پرتال مستندات VitePress (آدرس http://localhost:5180)
pnpm docs:dev

# اجرای ویزارد تعاملی خزنده سس
pnpm crawler:dev
```

### ۳. بررسی کیفیت، تست‌ها و تایپ‌چک
```bash
# اعتبارسنجی استاتیک تایپ‌های TypeScript و کامپوننت‌های Vue 3
pnpm --filter @sess/web type-check

# اجرای تست‌های واحد خط لوله ETL، استورها و موتورهای تداخل (TSX)
pnpm --filter @sess/web test

# تست‌های توابع پارسر و عبارات باقاعده خزنده
pnpm --filter @sess/crawler test

# اجرای تست‌های رگرسیون تصویری با Playwright
pnpm e2e:baseline
```

---

## 🌐 روش‌های استقرار در محیط پروداکشن

```
                    ┌───────────────────────────────┐
                    │      استراتژی‌های استقرار      │
                    └───────┬───────────────┬───────┘
                            │               │
            ┌───────────────▼──────┐ ┌──────▼────────────────┐
            │ سرور اختصاصی Node.js │ │ بستر محاسبات لبه      │
            │ (VPS / Docker)       │ │ (Cloudflare Workers)  │
            └──────────────────────┘ └───────────────────────┘
```

### شیوه ۱: سرور اختصاصی یکپارچه Node.js (پیشنهادی برای سرور و داکر)
فایل اجرایی یکپارچه ([server.js](file:///e:/Projects/Sess-Timetabling-App/server.js)) به صورت پویا ماژول `@sess/api` را بارگذاری کرده و همزمان وب‌اپلیکیشن کلاینت و اندپوینت‌های REST را روی یک پورت میزبانی می‌کند:

```bash
# ۱. کامپایل تمامی پکیج‌ها با Turborepo
pnpm build

# ۲. اجرای سرور در محیط پروداکشن
PORT=3000 NODE_ENV=production pnpm start
```

#### مدیریت پروسه‌ها با ابزار PM2:
```bash
npm install -g pm2
pm2 start server.js --name "sess-app" -i max
pm2 save
pm2 startup
```

### شیوه ۲: استقرار ابری در شبکه جهانی Cloudflare Workers
استقرار مستقیم گیت‌وی Hono در لبه با سرویس‌دهی فوق‌سریع فایل‌های فرانت‌اند از طریق Workers Assets:

```bash
# ۱. ورود به حساب کاربری کلودفلر
pnpm dlx wrangler login

# ۲. ایجاد فضای KV و بارگذاری اولیه داده‌های کاتالوگ
pnpm dlx wrangler kv namespace create DATA_KV
pnpm kv:seed

# ۳. انتشار ورکر و فایل‌های استاتیک فرانت‌اند
pnpm --filter @sess/api deploy
```

---

## 🗺️ نقشه راه و فازهای پیشرفت پروژه

- [x] **فاز ۱**: مهاجرت به معماری مونو‌ریپو (`pnpm workspaces` و `turborepo`).
- [x] **فاز ۲**: استخراج هسته خالص `@sess/core` (تایپ‌اسکریپت، اسکیماهای Zod و موتور ریاضی تداخل).
- [x] **فاز ۳**: راه‌اندازی گیت‌وی لبه `@sess/api` با Hono.js چندهدفه برای Cloudflare و Node.js.
- [x] **فاز ۴**: اتوماسیون خزنده مقاوم `@sess/crawler` با Playwright و ویزارد ترمینال.
- [x] **فاز ۵**: نوسازی کامل فرانت‌اند (`@sess/web` بر پایه Vue 3.5، Vuetify 3.7، Pinia 2 و معماری Feature-First).

---

## 🍴 انشعاب و توسعه مستقل (Fork & Development)

این پروژه به عنوان یک سامانه مرجع پایدار، کامل و آماده استفاده در دسترس عموم قرار گرفته است. در صورتی که تمایل دارید قابلیت‌های جدیدی به آن اضافه کنید، خزنده‌ها را برای پورتال سایر دانشگاه‌ها بازنویسی نمایید یا امکانات سامانه را سفارشی‌سازی کنید:

۱. **انشعاب مستقل (Fork)**: مخزن را در حساب کاربری شخصی یا سازمانی خود فورک نمایید.  
۲. **توسعه و نگهداری مستقل**: مطابق نیازمندی‌های دانشگاه و سلیقه خود، تنظیمات خزنده‌ها (`@sess/crawler`)، متغیرهای محیطی یا تم فرانت‌اند (`@sess/web`) را ویرایش و نگهداری کنید.  
۳. **استقرار مستقل**: نسخه شخصی‌سازی‌شده خود را با استفاده از راهنماهای جامع مستندات روی Cloudflare Workers، کانتینر Docker یا سرور اختصاصی خود مستقر سازید.

---

## 📄 مجوز انتشار (License)

این پروژه تحت مجوز **MIT** منتشر شده است. برای اطلاعات بیشتر فایل `LICENSE` را مطالعه فرمایید.

<div align="center">
  <br />
  <sub>توسعه‌یافته با عشق برای دانشجویان و علاقه‌مندان به نرم‌افزارهای آزاد و متن‌باز.</sub>
</div>
