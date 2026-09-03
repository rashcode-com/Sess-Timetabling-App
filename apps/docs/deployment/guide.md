# راهنمای جامع استقرار و عملیات (Deployment & Operations Guide)

این راهنما تمامی روش‌ها و استراتژی‌های استقرار برنامه اصلی **Sess-Timetabling-App** را به صورت گام‌به‌گام و مرحله‌به‌مرحله تشریح می‌کند؛ از **اجرای محلی و لوکال** تا **محاسبات لبه ابری (Cloudflare Workers)**، **میزبانی استاتیک رایگان (GitHub Pages و Vercel)** و **سرورهای شخصی/هاست‌های اشتراکی (VPS, Docker, cPanel)**.

---

## ۱. جدول مقایسه‌ای استراتژی‌های استقرار برنامه

با توجه به معماری قابل‌حمل (Portable Architecture) و تفکیک تمیز لایه‌ها، شما می‌توانید این برنامه را به شیوه‌های متفاوتی اجرا و میزبانی کنید:

| استراتژی استقرار | پلتفرم هدف | معماری لایه‌ها | نوع ذخیره‌سازی دیتا | مناسب برای |
| :--- | :--- | :--- | :--- | :--- |
| **۱. اجرای محلی (Local)** | کامپیوتر توسعه‌دهنده | کلاینت Vite + سرور Hono | فایل محلی `data.json` | توسعه، دیباگ و تست قابلیت‌ها |
| **۲. لبه ابری (Cloudflare Workers)** | شبکه جهانی Cloudflare | یکپارچه (Hono API + Workers Assets) | Cloudflare KV (`DATA_KV`) | ترافیک سنگین، تاخیر زیر ۱۰ میلی‌ثانیه |
| **۳. گیت‌هاب پیجز (GitHub Pages)** | سرورهای GitHub Pages | کلاینت خالص آفلاین (SPA) | باندل درون‌برنامه‌ای `data.json` | میزبانی رایگان و دائمی بدون سرور |
| **۴. ورسل (Vercel)** | شبکه جهانی Vercel Edge | کلاینت SPA (+ اتصال اختیاری به API) | حافظه کلاینت / API ابری | استقرار آنی و پیش‌نمایش برنچ‌ها |
| **۵. سرور اختصاصی / VPS** | لینوکس (Ubuntu/Debian) | سرور یکپارچه Node.js + PM2 / Nginx | دیسک محلی سرور + رم | دانشگاه‌ها، ارگان‌ها و سرورهای داخلی |
| **۶. کانتینر Docker** | سرورهای ابری، Kubernetes | کانتینر ایزوله چندمرحله‌ای لینوکس | فایل کانتینر یا Volume مشترک | زیرساخت‌های سازمانی و DevOps |
| **۷. هاست اشتراکی (cPanel)** | آپاچی / لایت‌اسپید | وب‌اپلیکیشن استاتیک با `.htaccess` | فایل استاتیک درون هاست | میزبانی ساده با پنل‌های اشتراکی |

---

## ۲. روش اول: اجرای لوکال و توسعه محلی (Local Execution)

سریع‌ترین روش برای راه‌اندازی پروژه بر روی کامپیوتر محلی:

### الف) اجرای حالت توسعه با Hot Module Replacement (HMR)

```bash
# ۱. نصب تمامی پیش‌نیازها در ریشه مونوریپو
pnpm install

# ۲. اجرای همزمان تمام سرویس‌ها با خط لوله موازی Turborepo
pnpm dev

# یا اجرای مجزای فرانت‌اند و API:
pnpm web:serve                      # فرانت‌اند در آدرس http://localhost:8081
pnpm --filter @sess/api dev:node    # سرویس API در آدرس http://localhost:3000
```

### ب) اجرای محلی نسخه پروداکشن (Unified Production Server)

فایل [server.js](file:///e:/Projects/Sess-Timetabling-App/server.js) در ریشه پروژه، کدهای بیلدشده فرانت‌اند و اندپوینت‌های Hono API را به صورت یکپارچه بر روی یک پورت سرویس‌دهی می‌کند:

```bash
# ۱. کامپایل نهایی تمامی پکیج‌ها
pnpm build

# ۲. اجرای سرور با پورت دلخواه
PORT=3000 NODE_ENV=production pnpm start
```
سپس سامانه در آدرس `http://localhost:3000` در دسترس است.

---

## ۳. روش دوم: استقرار در شبکه لبه Cloudflare Workers (استاندارد ۲۰۲۶)

این روش بالاترین عملکرد و کمترین زمان پاسخ (زیر ۱۰ میلی‌ثانیه در سراسر جهان) را فراهم می‌کند. در استاندارد سال ۲۰۲۶ کلودفلر، از قابلیت **Workers Assets** استفاده می‌شود؛ بدین معنا که هم کدهای گیت‌وی Hono و هم کلیه فایل‌های استاتیک فرانت‌اند (`apps/web/dist`) درون یک ورکر واحد مستقر می‌شوند.

```
                  ┌─────────────────────────────────────────┐
                  │       کاربر (User Request)              │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │    Cloudflare Edge Network (Anycast)    │
                  │  ┌───────────────────────────────────┐  │
                  │  │      @sess/api Hono Worker        │  │
                  │  │  - مسیرهای API (/api/*)           │  │
                  │  │  - سرویس استاتیک وب (Assets)      │  │
                  │  └─────────┬─────────────────────────┘  │
                  └────────────┼────────────────────────────┘
                               │
                               ▼
                  ┌────────────────────────┐
                  │  Cloudflare KV Storage │
                  │     (DATA_KV)          │
                  └────────────────────────┘
```

### مراحل گام‌به‌گام استقرار:

#### گام ۱: لاگین به حساب کاربری کلودفلر
```bash
pnpm dlx wrangler login
```

#### گام ۲: ایجاد فضای ذخیره‌سازی KV
یک فضای KV برای ذخیره‌سازی کاتالوگ ترم تحصیلی بسازید:
```bash
pnpm dlx wrangler kv namespace create DATA_KV
```
خروجی این دستور حاوی یک `id` اختصاصی است.

#### گام ۳: تنظیم فایل پیکربندی `wrangler.jsonc`
فایل نمونه `packages/api/wrangler.jsonc.example` را به `packages/api/wrangler.jsonc` کپی کرده و شناسه مرحله قبل را در آن قرار دهید:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "sess-timetabling-api",
  "main": "src/index.ts",
  "compatibility_date": "2026-09-01",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": "../../apps/web/dist",
    "binding": "ASSETS",
    "html_handling": "auto-trailing-slash",
    "not_found_handling": "single-page-application"
  },
  "kv_namespaces": [
    {
      "binding": "DATA_KV",
      "id": "<شناسه_KV_شما>"
    }
  ]
}
```

#### گام ۴: بارگذاری اولیه داده‌های درسی (Seeding)
داده‌های اولیه دروس را در فضای KV کلودفلر ذخیره کنید:
```bash
pnpm kv:seed
```

#### گام ۵: کامپایل و انتشار نهایی در لبه
```bash
# بیلد تمامی پکیج‌ها (کلاینت و هسته)
pnpm build

# انتشار روی شبکه کلودفلر
pnpm --filter @sess/api deploy
```

> [!TIP]
> **اتوماسیون کامل با GitHub Actions:** در مخزن پروژه فایل ورک‌فلو [.github/workflows/deploy.yml](file:///e:/Projects/Sess-Timetabling-App/.github/workflows/deploy.yml) از قبل تعبیه شده است. کافیست دو سکرت `CLOUDFLARE_API_TOKEN` و `CLOUDFLARE_ACCOUNT_ID` را در تب Settings > Secrets گیت‌هاب تنظیم کنید تا با هر کامیت، استقرار خودکار انجام شود.

---

## ۴. روش سوم: استقرار کلاینت روی GitHub Pages (کاملاً رایگان)

وب‌اپلیکیشن `@sess/web` به گونه‌ای مهندسی شده که داده‌های ترم تحصیلی را از فایل داخلی `src/data/data.json` بارگذاری کرده و بدون نیاز به بک‌اند سرور نیز به صورت کاملاً مستقل و آفلاین در مرورگر کاربر کار می‌کند. از این رو، می‌توانید فرانت‌اند را به صورت رایگان روی **GitHub Pages** میزبانی نمایید.

### مراحل گام‌به‌گام:

#### گام ۱: ساخت فایل ورک‌فلو خودکار در مخزن
یک فایل جدید در مسیر `.github/workflows/deploy-web-pages.yml` با محتوای زیر ایجاد کنید:

```yaml
name: Deploy Web App to GitHub Pages

on:
  push:
    branches: [main, master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 11.21.0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build Web Application
        run: pnpm --filter @sess/web build

      - name: Setup SPA 404 Fallback
        run: cp apps/web/dist/index.html apps/web/dist/404.html

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: apps/web/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

#### گام ۲: حل مسئله روتینگ در GitHub Pages (SPA Fallback)
به دلیل اینکه در معماری Single Page Application از HTML5 History Mode استفاده می‌شود، در صورت رفرش صفحه در مسیری غیر از روت، سرور گیت‌هاب خطای ۴۰۴ می‌دهد. کپی کردن فایل `index.html` به نام `404.html` (که در خط ۲۹ ورک‌فلو بالا گنجانده شده) این مسئله را به طور کامل حل می‌کند.

#### گام ۳: فعال‌سازی در تنظیمات گیت‌هاب
1. به مخزن پروژه در GitHub بروید.
2. به بخش **Settings** > **Pages** مراجعه کنید.
3. مقدار **Source** را بر روی **GitHub Actions** قرار دهید. با اولین پوش به برنچ اصلی، سایت کلاینت منتشر خواهد شد.

---

## ۵. روش چهارم: استقرار سریع روی Vercel

پلتفرم Vercel برای استقرار و اتصال خودکار به گیت‌هاب بسیار پرطرفدار است.

### مراحل راه‌اندازی در داشبورد Vercel:

1. به داشبورد [Vercel](https://vercel.com/) وارد شده و روی دکمه **Add New Project** کلیک کنید.
2. مخزن پروژه را انتخاب و دکمه **Import** را بزنید.
3. در صفحه تنظیمات ساخت (**Configure Project**):
   * **Framework Preset**: گزینه `Vite` را انتخاب کنید.
   * **Root Directory**: روی `apps/web` تنظیم کنید (یا ریشه پروژه را انتخاب نمایید).
   * **Build Command**: `pnpm --filter @sess/web build`
   * **Output Directory**: `apps/web/dist` (یا در صورت انتخاب روت `apps/web`، مقدار `dist`).
   * **Install Command**: `pnpm install`

#### فایل پیکربندی ریدایرکت‌های SPA در ورسل (`apps/web/vercel.json`):
برای جلوگیری از خطای ۴۰۴ هنگام رفرش صفحات:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## ۶. روش پنجم: سرور اختصاصی لینوکس، VPS و هاست شخصی (Self-Hosted)

### شیوه الف) اجرای سرور یکپارچه با PM2 (پیشنهادی برای VPS)

روی سرورهای ابری نظیر Ubuntu یا Debian:

```bash
# ۱. کلون پروژه روی سرور
git clone https://github.com/rashcode-com/Sess-Timetabling-App.git /var/www/sess-app
cd /var/www/sess-app

# ۲. فعال‌سازی pnpm و نصب پکیج‌ها
corepack enable
pnpm install --frozen-lockfile

# ۳. کامپایل تمامی پکیج‌ها
pnpm build

# ۴. نصب ابزار مدیریت پروسه PM2
npm install -g pm2

# ۵. اجرای سرور به صورت Daemon در پس‌زمینه
PORT=3000 NODE_ENV=production pm2 start server.js --name "sess-app" -i max

# ۶. ذخیره وضعیت برای راه‌اندازی خودکار پس از ریستارت سرور
pm2 save
pm2 startup
```

---

### شیوه ب) تنظیم پروکسی معکوس و کش با Nginx

جهت مدیریت اتصالات SSL، فشرده‌سازی امن و فوروارد درخواست‌ها به پروسه Node.js:

```nginx
# نمونه کانفیگ /etc/nginx/sites-available/sess-app.conf

server {
    listen 80;
    server_name sess.yourdomain.ir;

    # فشرده‌سازی خودکار
    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;

    # کش بلندمدت فایل‌های استاتیک کامپایل‌شده فرانت‌اند
    location /assets/ {
        alias /var/www/sess-app/apps/web/dist/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # ارسال تمامی ترافیک به سرور Node.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

فعال‌سازی کانفیگ در لینوکس:
```bash
sudo ln -s /etc/nginx/sites-available/sess-app.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### شیوه ج) استقرار ایزوله در کانتینر Docker و Docker Compose

برای اجرای بدون دردسر روی سرورهای حاوی داکر، از Dockerfile بهینه‌سازی‌شده چندمرحله‌ای پروژه استفاده کنید:

```dockerfile
# Multi-Stage Production Dockerfile
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=build /app/server.js ./server.js
COPY --from=build /app/packages/api ./packages/api
COPY --from=build /app/packages/core ./packages/core
COPY --from=build /app/apps/web/dist ./apps/web/dist
COPY --from=build /app/apps/web/src/data ./apps/web/src/data
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "server.js"]
```

اجرا با دستورات داکر:
```bash
# بیلد ایمیج پروداکشن
docker build -t sess-app .

# اجرای کانتینر روی پورت ۳۰۰۰
docker run -d -p 3000:3000 --name sess-container --restart unless-stopped sess-app
```

نمونه فایل `docker-compose.yml`:
```yaml
version: '3.8'

services:
  sess-app:
    build: .
    container_name: sess-timetabling-app
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
```

---

### شیوه د) استقرار روی هاست‌های اشتراکی cPanel / DirectAdmin (با وب‌سرور Apache)

اگر تنها به یک هاست اشتراکی بر پایه آپاچی یا لایت‌اسپید دسترسی دارید:
1. روی کامپیوتر خود دستور `pnpm web:build` را اجرا کنید تا پوشه `apps/web/dist` تولید شود.
2. کلیه فایل‌ها و پوشه‌های درون `apps/web/dist` را در پوشه `public_html` هاست آپلود نمایید.
3. یک فایل با نام `.htaccess` در ریشه `public_html` ایجاد کرده و دستورات زیر را در آن قرار دهید تا مسیریابی صفحات بدون خطا انجام گیرد:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # اگر فایل یا دایرکتوری درخواست‌شده فیزیکی وجود دارد، مستقیماً لود شود
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d

  # در غیر این صورت، تمام درخواست‌ها به index.html فرانت‌اند هدایت شوند
  RewriteRule ^(.*)$ /index.html [L]
</IfModule>

# بهینه‌سازی کش فایل‌های فونت و استایل
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType image/png "access plus 1 month"
  ExpiresByType image/svg+xml "access plus 1 month"
</IfModule>
```
