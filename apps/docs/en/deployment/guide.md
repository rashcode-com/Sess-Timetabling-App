# Comprehensive Production Deployment & Operations Guide

This guide covers production deployment strategies, cloud edge configurations, static hosting, containerization, and native packaging for the main application of **Sess-Timetabling-App**. It provides step-by-step instructions from **local execution** to **Cloudflare Workers**, **GitHub Pages**, **Vercel**, and **self-hosted servers / shared web hosts**.

---

## 1. Deployment Strategies Comparison Matrix

Thanks to the portable monorepo architecture and clean separation of concerns, the application can be deployed across multiple distinct environments:

| Deployment Strategy | Target Platform | Layer Architecture | Data Storage Engine | Ideal Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **1. Local Execution** | Developer Workstation | Vite Client + Hono Server | Local JSON (`data.json`) | Feature development, debugging, and testing |
| **2. Cloudflare Workers** | Global Edge Anycast Network | Unified (Hono API + Workers Assets) | Cloudflare KV (`DATA_KV`) | High peak traffic, sub-10ms global edge response |
| **3. GitHub Pages** | GitHub Static Infrastructure | Self-Contained Client SPA | Bundled `data.json` | 100% free, zero-maintenance static client hosting |
| **4. Vercel** | Vercel Edge Network | Client SPA (+ Optional Edge API) | Client Storage / Edge API | Instant branch previews and continuous deployments |
| **5. Dedicated Server / VPS** | Linux (Ubuntu, Debian, AlmaLinux) | Unified Node.js Runner + PM2 / Nginx | Local Disk + In-Memory Cache | University intranets, institutional on-premise servers |
| **6. Docker Container** | Cloud Clusters, Kubernetes | Multi-Stage Linux Container | Container FS or Shared Volume | DevOps automation and container orchestration |
| **7. Shared Hosting (cPanel)** | Apache / LiteSpeed Web Server | Static Client with `.htaccess` | Static Files on Host | Traditional shared web hosting with no shell access |

---

## 2. Method 1: Local Execution & Development

The quickest way to run the full application ecosystem locally on your workstation:

### A) Development Mode with Hot Module Replacement (HMR)

```bash
# 1. Install dependencies across the monorepo
pnpm install

# 2. Run all workspace services in parallel via Turborepo
pnpm dev

# Or run frontend and API independently:
pnpm web:serve                      # Frontend SPA at http://localhost:8081
pnpm --filter @sess/api dev:node    # REST API at http://localhost:3000
```

### B) Local Unified Production Server

The [server.js](file:///e:/Projects/Sess-Timetabling-App/server.js) entrypoint at the repository root dynamically imports `@sess/api` and serves both the compiled Vue 3.5 SPA frontend and the REST API on a single port:

```bash
# 1. Compile production bundles across all packages
pnpm build

# 2. Launch production server with configurable port
PORT=3000 NODE_ENV=production pnpm start
```
The complete application is now accessible at `http://localhost:3000`.

---

## 3. Method 2: Cloudflare Workers Edge Deployment (2026 Standard)

This method provides the lowest latency (under 10ms globally) and highest reliability. In Cloudflare's 2026 architecture, **Workers Assets** bundles both the Hono API gateway and the static frontend SPA (`apps/web/dist`) into a unified edge deployment without requiring a separate Pages project.

```
                  ┌─────────────────────────────────────────┐
                  │              User Request               │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │    Cloudflare Edge Network (Anycast)    │
                  │  ┌───────────────────────────────────┐  │
                  │  │      @sess/api Hono Worker        │  │
                  │  │  - REST API Routes (/api/*)       │  │
                  │  │  - Static Web SPA (Workers Assets)│  │
                  │  └─────────┬─────────────────────────┘  │
                  └────────────┼────────────────────────────┘
                               │
                               ▼
                  ┌────────────────────────┐
                  │  Cloudflare KV Storage │
                  │     (DATA_KV)          │
                  └────────────────────────┘
```

### Step-by-Step Setup:

#### Step 1: Authenticate with Cloudflare
```bash
pnpm dlx wrangler login
```

#### Step 2: Create Cloudflare KV Namespace
Create the KV namespace for persisting semester catalog datasets:
```bash
pnpm dlx wrangler kv namespace create DATA_KV
```
This output includes a unique namespace `id`.

#### Step 3: Configure `packages/api/wrangler.jsonc`
Copy `packages/api/wrangler.jsonc.example` to `packages/api/wrangler.jsonc` and insert your KV ID:

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
      "id": "<YOUR_KV_NAMESPACE_ID>"
    }
  ]
}
```

#### Step 4: Seed Semester Course Catalog Data
Seed initial course catalog data into Cloudflare KV:
```bash
pnpm kv:seed
```

#### Step 5: Compile & Deploy to Cloudflare Edge
```bash
# Compile all packages (core, web, api)
pnpm build

# Deploy worker and web assets to Cloudflare
pnpm --filter @sess/api deploy
```

> [!TIP]
> **Automated CI/CD with GitHub Actions**: The repository includes [.github/workflows/deploy.yml](file:///e:/Projects/Sess-Timetabling-App/.github/workflows/deploy.yml). Simply add your `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` under GitHub repository **Settings** > **Secrets and variables** > **Actions** to trigger automated edge deployments on every commit.

---

## 4. Method 3: GitHub Pages Deployment (Free Static Client)

The `@sess/web` client application is architected to load semester course catalogs from the static asset `public/data/data.json`. It can operate entirely standalone in the browser with full search, calendar scheduling, and conflict detection capabilities without requiring a server backend. This makes it an ideal fit for **GitHub Pages**.

### Step-by-Step Setup:

#### Step 1: Create GitHub Actions Workflow File
Create a new file at `.github/workflows/deploy-web-pages.yml`:

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

#### Step 2: SPA 404 Routing Fallback
Because Vue Router uses HTML5 History Mode, refreshing a sub-route on static servers generates a 404 response. Copying `index.html` to `404.html` (handled automatically on line 39 of the workflow above) ensures GitHub Pages forwards all requests to the Vue router.

#### Step 3: Enable GitHub Pages in Repository Settings
1. Go to your GitHub repository.
2. Navigate to **Settings** > **Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.

---

## 5. Method 4: Vercel Monorepo Deployment

Vercel provides native Vite support, instant branch preview URLs, and high-performance edge streaming.

### Step-by-Step Setup in Vercel Dashboard:

1. Open the [Vercel Dashboard](https://vercel.com/) and click **Add New Project**.
2. Select your repository and click **Import**.
3. Under **Configure Project**:
   * **Framework Preset**: Select `Vite`.
   * **Root Directory**: Set to `apps/web` (or root with workspace filter).
   * **Build Command**: `pnpm --filter @sess/web build`
   * **Output Directory**: `apps/web/dist` (or `dist` if root was set to `apps/web`).
   * **Install Command**: `pnpm install`

#### SPA Rewrite Rules Configuration (`apps/web/vercel.json`):
To prevent 404 errors on page reloads across Vue Router routes:
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

## 6. Method 5: Self-Hosted Server, VPS & Shared Hosting

### Option A) Unified Node.js Server with PM2 (Recommended for VPS)

On Ubuntu, Debian, or AlmaLinux servers:

```bash
# 1. Clone repository to server
git clone https://github.com/rashcode-com/Sess-Timetabling-App.git /var/www/sess-app
cd /var/www/sess-app

# 2. Enable pnpm and install dependencies
corepack enable
pnpm install --frozen-lockfile

# 3. Build all workspace packages
pnpm build

# 4. Install PM2 process manager
npm install -g pm2

# 5. Launch background daemon cluster
PORT=3000 NODE_ENV=production pm2 start server.js --name "sess-app" -i max

# 6. Persist process across system reboots
pm2 save
pm2 startup
```

---

### Option B) Reverse Proxy & Caching with Nginx

Nginx terminates SSL certificates, applies Gzip/Brotli compression, and forwards traffic to the Node.js server process:

```nginx
# Sample /etc/nginx/sites-available/sess-app.conf

server {
    listen 80;
    server_name sess.yourdomain.com;

    # Compression
    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;

    # Long-term caching for static client assets
    location /assets/ {
        alias /var/www/sess-app/apps/web/dist/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Proxy all traffic to Node.js runner
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

Enable on Ubuntu/Debian:
```bash
sudo ln -s /etc/nginx/sites-available/sess-app.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### Option C) Isolated Multi-Stage Docker Container

Deploy using this optimized multi-stage `Dockerfile`:

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
COPY --from=build /app/packages/data ./packages/data
COPY --from=build /app/apps/web/dist ./apps/web/dist
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:
```bash
# Build production image
docker build -t sess-app .

# Run container on port 3000
docker run -d -p 3000:3000 --name sess-container --restart unless-stopped sess-app
```

Sample `docker-compose.yml`:
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

### Option D) Shared Hosting (cPanel / DirectAdmin with Apache)

For traditional shared cPanel/DirectAdmin hosting environments:
1. Compile the web bundle locally: `pnpm web:build`.
2. Upload all files from `apps/web/dist` directly into `public_html`.
3. Create a `.htaccess` file in `public_html` to support Vue Router HTML5 history mode:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Serve existing files and directories directly
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d

  # Rewrite all other requests to index.html
  RewriteRule ^(.*)$ /index.html [L]
</IfModule>

# Cache headers for fonts and static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType image/png "access plus 1 month"
  ExpiresByType image/svg+xml "access plus 1 month"
</IfModule>
```
