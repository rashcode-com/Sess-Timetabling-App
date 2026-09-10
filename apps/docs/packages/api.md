# گیت‌وی API لبه (`@sess/api`)

پکیج `@sess/api` لایه واسط ارتباطی (API Gateway) پرسرعت و بهینه‌سازی‌شده برای محاسبات لبه (Edge Computing) است. این ماژول با فریم‌ورک استاندارد وب **Hono.js** پیاده‌سازی شده و از قابلیت **قابلیت حمل چندهدفه (Multi-Target Portability)** بهره می‌برد؛ بدین معنا که بدون هیچ تغییری در کدهای سورس، هم بر بستر شبکه جهانی سرورهای ابری **Cloudflare Workers** و هم در محیط سنتی سرورهای **Node.js** با نهایت بازدهی اجرا می‌شود.

---

## ۱. اهداف و جایگاه معماری (Architecture & Capabilities)

```mermaid
graph TD
    subgraph Clients ["کلاینت‌ها و ارسال‌کنندگان"]
        WebSPA["اپلیکیشن وب کلاینت (Web SPA)"]
        CrawlerCli["سرویس کراولر داده (Crawler CLI)"]
    end

    subgraph HonoApp ["@sess/api Gateway (Hono.js)"]
        Routes["مسیریاب‌ها (routes/courses, departments, health, sync)"]
        Validation["اعتبارسنجی Zod (@hono/zod-validator)"]
        Storage["آداپتور سراسری ذخیره‌سازی (Universal Storage)"]
        Cascade["حل مسیر لایه‌ای (Layered Cascade Paths)"]
    end

    subgraph Targets ["محیط‌های استقرار و ران‌تایم"]
        CF["Cloudflare Workers + KV Storage (Edge)"]
        NODE["Node.js Server + Local JSON (Standalone)"]
    end

    WebSPA --> Routes
    CrawlerCli --> Routes
    Routes --> Validation
    Validation --> Storage
    Storage --> Cascade
    Storage --> CF
    Storage --> NODE
```

### ویژگی‌های شاخص فنی:
1. **Edge Execution (<10ms Response)**: اجرای سریع بر پایه استانداردهای Web Fetch API بدون سربار فریم‌ورک‌های سنگین.
2. **Universal Storage Abstraction (`storage.ts`)**: تشخیص هوشمند اتصال به **Cloudflare KV** در لبه یا خواندن/نوشتن فایل محلی `data.json` در سرورهای محلی یا تست.
3. **Layered Cascade Path Resolver (`paths.ts`)**: الگوریتم حل مسیر چندلایه‌ای برای تعیین دقیق مسیر فایل‌های استاتیک کلاینت (`apps/web/dist`) و دیتابیس در محیط‌های مونوریپو و ایمیج‌های داکر.
4. **Zero-Side-Channel Security (`sync.ts`)**: مقایسه توکن‌های امنیتی ادمین با استفاده از الگوریتم مقاوم در برابر حملات تحلیل زمانی (Timing-Safe Comparison با SHA-256 و Web Crypto).

---

## ۲. مشخصات و اندپوینت‌های API (REST Endpoints)

همه اندپوینت‌ها تحت پیش‌وند `/api` سرویس‌دهی می‌کنند.

### ۱. وضعیت سلامت سرور (`GET /api/health`)
جهت بررسی کارکرد گیت‌وی و تشخیص نوع ران‌تایم فعال (کلودفلر یا نودجی‌اس).

* **نمونه پاسخ:**
```json
{
  "status": "ok",
  "runtime": "cloudflare-workers",
  "timestamp": "2026-08-28T14:30:00.000Z",
  "version": "0.1.0"
}
```

---

### ۲. فهرست نیم‌سال‌های تحصیلی (`GET /api/semesters`)
لیستی از تمامی نیم‌سال‌های تحصیلی موجود در کاتالوگ، نیم‌سال فعال و تاریخ آخرین به‌روزرسانی دیتاست را برمی‌گرداند.

* **نمونه پاسخ:**
```json
{
  "active_semester": "1402-1",
  "semesters": [
    "1402-1"
  ],
  "updated_at": "2023-08-31T07:48:00.000Z"
}
```

---

### ۳. فهرست دپارتمان‌ها و دانشکده‌ها (`GET /api/departments`)
لیستی از تمامی دپارتمان‌ها و واحدهای آموزشی موجود در کاتالوگ درسی را برمی‌گرداند.

* **پارامترهای جستجو (Query Parameters):**
  * `semester` (اختیاری): کد نیم‌سال تحصیلی (پیش‌فرض: نیم‌سال فعال کاتالوگ).

* **نمونه پاسخ:**
```json
{
  "count": 3,
  "departments": [
    "بخش مهندسی کامپیوتر و فناوری اطلاعات",
    "بخش ریاضی",
    "بخش فیزیک"
  ]
}
```

---

### ۴. جستجو و فیلتر دروس (`GET /api/courses`)
دریافت لیست دروس ارائه‌شده با قابلیت فیلترهای چندگانه از طریق Query Parameters.

* **پارامترهای جستجو (Query Parameters):**
  * `semester` (اختیاری): کد نیم‌سال تحصیلی (پیش‌فرض: نیم‌سال فعال).
  * `department` (اختیاری): فیلتر بر اساس نام دانشکده/بخش.
  * `query` (اختیاری): جستجو در عنوان درس یا شناسه عددی درس.
  * `teacher` (اختیاری): نام استاد ارائه دهنده.
  * `day` (اختیاری): روز برگزاری در طول هفته.
  * `limit` (اختیاری): تعداد حداکثر رکوردهای بازگشتی.

* **نمونه درخواست:**
```http
GET /api/courses?department=کامپیوتر&teacher=احمدی&limit=10 HTTP/1.1
```

* **نمونه پاسخ:**
```json
{
  "count": 1,
  "courses": [
    {
      "id": "290331041^1",
      "title": "طراحی الگوریتم‌ها",
      "vahed": "3",
      "group": "1",
      "teacher": "علی احمدی",
      "gender": "مختلط",
      "unit": "بخش مهندسی کامپیوتر",
      "time_in_week": "شنبه و دوشنبه 10:00 - 12:00",
      "time_room": "شنبه: 10:00-12:00 (کلاس 201)",
      "midterm_date": "",
      "midterm_time": "",
      "capacity": "40",
      "final_time": "10:00 - 12:00",
      "final_date": "1403/03/20",
      "final_time_split": {
        "start_hour": 10,
        "start_minute": 0,
        "end_hour": 12,
        "end_minute": 0
      },
      "final_date_split": {
        "d": 20,
        "m": 3,
        "y": 1403
      },
      "seperated_time_and_place": [
        {
          "place": "کلاس 201",
          "day": "شنبه",
          "startHour": 10,
          "startMinute": 0,
          "endHour": 12,
          "endMinute": 0
        }
      ]
    }
  ]
}
```

---

### ۵. دریافت مشخصات یک درس با شناسه (`GET /api/courses/:id`)
* **پارامترهای جستجو (Query Parameters):**
  * `semester` (اختیاری): کد نیم‌سال تحصیلی (پیش‌فرض: نیم‌سال فعال).

* **نمونه درخواست:**
```http
GET /api/courses/290331041^1 HTTP/1.1
```

---

### ۶. هماهنگ‌سازی دیتاست ترم تحصیلی (`POST /api/sync`)
اندپوینت اختصاصی جهت دریافت داده‌های استخراج‌شده از کراولر پورتال و ثبت در پایگاه‌داده.

* **احراز هویت:** ارسال کلید اختصاصی در هدر `Authorization: Bearer <TOKEN>` یا هدر `X-Sync-Token: <TOKEN>` (محافظت‌شده در برابر حملات کانال جانبی با زمان ثابت `timingSafeEqual`).
* **اعتبارسنجی بدنه (Body):** پشتیبانی از هر دو ساختار `UnifiedCatalogSchema` (چندترم همراه با متادیتا) و `SemesterDataSchema` (تخت تک‌ترم).
* **هدر کمکی:** در صورت ارسال دیتای تخت، شناسه نیم‌سال را می‌توان از طریق هدر `X-Semester: <id>` یا پارامتر کوئری `?semester=<id>` ارسال کرد.

* **نمونه پاسخ موفق:**
```json
{
  "success": true,
  "message": "Semester dataset synced successfully",
  "stats": {
    "departments": 35,
    "courses": 1420,
    "timestamp": "2026-08-28T15:00:00.000Z"
  }
}
```

---

## ۳. لایه ذخیره‌سازی یکپارچه (`storage.ts`)

آداپتور داده از یک استراتژی هوشمند چندسطحی برای کش و ماندگاری داده‌ها بهره می‌برد:

```mermaid
flowchart TD
    Req["درخواست دریافت داده (getSemesterData)"]
    MemCheck{"آیا کش ایزوله حافظه معتبر است؟ (TTL: 60s)"}
    ReturnMem["بازگرداندن سریع از حافظه Isolate"]
    KVCheck{"آیا بایندینگ Cloudflare KV وجود دارد؟"}
    ReadKV["خواندن از KV با کش توزیع‌شده edge (TTL: 300s)"]
    ReadNode["خواندن آبشاری از فایل محلی data.json در دیسک"]

    Req --> MemCheck
    MemCheck -- بله --> ReturnMem
    MemCheck -- خیر --> KVCheck
    KVCheck -- بله --> ReadKV
    KVCheck -- خیر --> ReadNode
    ReadKV --> ReturnMem
    ReadNode --> ReturnMem
```

1. **In-Memory Isolate Cache**: کش موقت در سطح حافظه رم با طول عمر ۶۰ ثانیه به منظور کاهش چشمگیر درخواست‌های مکرر به KV و دیسک.
2. **Cloudflare KV Integration**: ذخیره کاتالوگ تحت کلید `semester_data` با زمان حیات کش لبه (Edge Cache TTL) به مدت ۵ دقیقه.
3. **Failover Filesystem**: در صورت عدم اتصال به کلودفلر یا بروز خطا، داده‌ها از فایل‌های فیزیکی دیسک فراخوانی و ذخیره می‌شوند.

### حل‌کننده آبشاری مسیرها (`paths.ts`)
جهت تعیین مسیرهای دیسک در شرایط مختلف استقرار (Monorepo، داکر یا سرور مجزا)، ماژول `paths.ts` از الگوریتم آبشاری چندسطحی بهره می‌برد:
* `resolveWebDistPath`: ابتدا مقدار متغیر محیطی `WEB_DIST_PATH` را چک کرده، سپس نشانگرهای ریشه مونو‌ریپو (`pnpm-workspace.yaml`) را بررسی نموده و در نهایت به پوشه `apps/web/dist` نسبت به دایرکتوری جاری اشاره می‌کند.
* `resolveDataFilePath`: با اولویت متغیر `DATA_FILE_PATH` یا مسیر آبشاری به فایل کانونیکال پکیج داده `packages/data/datasets/data.json`.

---

## ۴. متغیرهای محیطی و تنظیمات (.dev.vars / .env)

برای اجرای محلی با Wrangler فایل `.dev.vars` و برای اجرای مستقل سرور Node.js فایل `.env` را در `packages/api/` تنظیم کنید:

| متغیر محیطی | الزامی | شرح و کاربرد | نمونه مقدار |
| :--- | :---: | :--- | :--- |
| `SYNC_TOKEN` | بله (پروداکشن) | کلید امنیتی احراز هویت برای اندپوینت `POST /api/sync` | `"your_strong_secret_token"` |
| `WEB_DIST_PATH` | خیر | مسیر مستقیم دایرکتوری فایل‌های کامپایل‌شده وب (`apps/web/dist`) | `"/app/apps/web/dist"` |
| `DATA_FILE_PATH` | خیر | مسیر مستقیم فایل کاتالوگ دروس محلی (`data.json`) | `"/app/packages/data/datasets/data.json"` |
| `PORT` | خیر | پورت شنود سرور اختصاصی Node.js (پیش‌فرض: ۳۰۰۰) | `3000` |

---

## ۵. راه‌اندازی، اجرا و استقرار

### اجرای محیط شبیه‌ساز Cloudflare با Wrangler
```bash
pnpm api:dev
```

### اجرای مستقل بر روی سرور Node.js (حالت واچ)
```bash
pnpm --filter @sess/api dev:node
```

### بارگذاری اولیه داده‌ها در فضای Cloudflare KV
```bash
pnpm kv:seed
```

### استقرار مستقیم بر روی سرورهای جهانی کلودفلر
```bash
pnpm --filter @sess/api deploy
```
