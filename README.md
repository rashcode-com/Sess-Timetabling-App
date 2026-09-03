<div align="center">

# 🎓 SESS Timetabling & Course Scheduling System

**Enterprise-Grade Academic Timetable Planner, Class & Final Exam Conflict Detector for Iranian Universities**  
*Built for Shiraz University & Shahrekord University SESS Portals • Powered by Core-First Monorepo Architecture*

[![License: MIT](https://img.shields.io/badge/License-MIT-8c57ff.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Turborepo](https://img.shields.io/badge/Monorepo-Turborepo-ef4444.svg?style=for-the-badge&logo=turborepo)](https://turbo.build/repo)
[![pnpm](https://img.shields.io/badge/pnpm-v11-f69220.svg?style=for-the-badge&logo=pnpm)](https://pnpm.io/)
[![Vue 3.5](https://img.shields.io/badge/Vue-3.5%20Composition%20API-42b883.svg?style=for-the-badge&logo=vuedotjs)](https://vuejs.org/)
[![Vite 6](https://img.shields.io/badge/Vite-6.0-646cff.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Vuetify 3](https://img.shields.io/badge/Vuetify-3.7%20Material%20Design%203-1867c0.svg?style=for-the-badge&logo=vuetify)](https://vuetifyjs.com/)
[![Pinia](https://img.shields.io/badge/Pinia-2.3-ffd859.svg?style=for-the-badge&logo=vuedotjs)](https://pinia.vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Edge-Cloudflare%20Workers-f38020.svg?style=for-the-badge&logo=cloudflare)](https://workers.cloudflare.com/)
[![Playwright](https://img.shields.io/badge/E2E-Playwright%201.49-45ba4b.svg?style=for-the-badge&logo=playwright)](https://playwright.dev/)

<br />

[English Documentation](./README.md) • [راهنمای فارسی](./README.fa.md) • [Interactive Documentation Portal (VitePress)](https://github.com/rashcode-com/Sess-Timetabling-App)

</div>

---

## 🌟 Executive Summary & Problem Space

Course selection (*Entekhab Vahed*) in Iranian university portals using the legacy **SESS (سامانه مدیریت آموزش سس)** system presents severe challenges for students and academic advisors:

- **Complex Overlapping Constraints**: Simultaneous class slots across multiple departments frequently result in undetected timetable clashes.
- **Unpredictable Exam Schedules**: Final exams often overlap on identical dates and time windows, forcing emergency course drops.
- **Dispersed Campus Locations**: Classes are scheduled across distant educational buildings with tight or impossible transit intervals.
- **Fragmented Data Access**: Students are forced to inspect static, tabular HTML pages without interactive search, filtering, or schedule visualization.

**Sess-Timetabling-App** resolves these friction points by introducing an automated, modern software ecosystem. Built around a **Core-First Monorepo Architecture**, the platform extracts, normalizes, simulates, and mathematically verifies course schedules in real-time, delivering a smooth single-page application experience with zero server round-trip latency.

---

## 📸 Visual Showcase & User Interface

The client application is built with **Vue 3.5**, **Vuetify 3.7 (Material Design 3)**, and **Vazirmatn FD** typography, featuring native Persian RTL layouts, responsive mobile viewports, and dynamic light/dark theming:

| **1. Faceted Course Search & Filters** | **2. Course Specifications & Capacity** |
| :---: | :---: |
| [![Course Search & Filtering](./apps/docs/public/screenshots/01-course-search-table.png)](./apps/docs/public/screenshots/01-course-search-table.png) | [![Expanded Course Specifications](./apps/docs/public/screenshots/02-course-expanded-details.png)](./apps/docs/public/screenshots/02-course-expanded-details.png) |
| *Real-time multi-criteria filtering by department, course, teacher, day, and time slots with reactive chips* | *Expandable data table rows displaying units, capacity, department, and exam schedules* |

| **3. Iranian Weekly Timetable Calendar** | **4. Course Details & Selected Units** |
| :---: | :---: |
| [![Weekly Timetable Calendar](./apps/docs/public/screenshots/03-weekly-calendar-schedule.png)](./apps/docs/public/screenshots/03-weekly-calendar-schedule.png) | [![Course Details & Selected Units](./apps/docs/public/screenshots/04-course-detail-modal.png)](./apps/docs/public/screenshots/04-course-detail-modal.png) |
| *Interactive Saturday–Friday weekly schedule grid with automatic color coding and time slot distribution* | *Modal dialog with complete course specifications and active unit summation drawer* |

<div align="center">

### 5. Real-Time Conflict & Clash Detection
[![Clash Detection Modal](./apps/docs/public/screenshots/05-clash-detection-modal.png)](./apps/docs/public/screenshots/05-clash-detection-modal.png)
*Side-by-side clash detection modal pinpointing overlapping weekly class hours and exam conflicts in real-time*

</div>

---

## 🏛️ Core-First Monorepo Architecture

The monorepo enforces the **Core-First Architectural Principle**: business logic, scheduling algorithms, and schema definitions are strictly separated from UI frameworks and server runtimes.

| Pipeline Stage | Module / Component | Data Input / Output | Key Technology |
| :--- | :--- | :--- | :--- |
| **1. Portal Ingestion** | 🏛️ University SESS Portals | HTML schedule tables from Shiraz / Shahrekord | Remote HTTP Sessions |
| **2. Extraction & Parsing** | 🕷️ `@sess/crawler` | Playwright engine ➔ Text normalization (`parser.ts`) | Playwright Chromium, CLI Wizard |
| **3. Edge / Cloud Sync** | ⚡ `@sess/api` | `POST /api/sync` ➔ Cloudflare KV storage (`semester_data`) | Hono.js Edge API, Timing-Safe Auth |
| **4. Local Storage** | 📁 `apps/web/src/data/` | Direct JSON export (`data.json`) for local/offline run | Static JSON Dataset |
| **5. Client Scheduling** | 💻 `@sess/web` | Vue 3.5 SPA ➔ Saturday–Friday timetable grid & $O(1)$ search | Vue 3.5, Vuetify 3.7, Pinia 2 |
| **6. Pure Core Engine** | 🧠 `@sess/core` | Universal Zod schemas & mathematical conflict calculators | Zero-dependency TypeScript |

##### 🔗 Data Flow Lifecycle:
1. **Extraction**: `@sess/crawler` scrapes Shiraz / Shahrekord portals with Playwright, normalizes Persian numerals, and validates against `@sess/core` Zod schemas.
2. **Distribution**:
   - **Cloud Edge**: Crawler sends verified payload via authenticated `POST /api/sync` to `@sess/api`, caching it in Cloudflare KV.
   - **Local File**: Crawler exports `data.json` directly into `apps/web/src/data/` for local builds or self-contained deployments.
3. **Consumption & Interaction**: `@sess/web` serves students through an interactive Saturday–Friday weekly schedule, instant $O(1)$ indexed searches, and real-time conflict detection powered by `@sess/core`.

### Monorepo Workspaces Matrix

The repository is managed via **pnpm workspaces** and orchestrates parallel pipelines using **Turborepo**:

```text
Sess-Timetabling-App/
├── apps/
│   ├── web/               # @sess/web — Vue 3.5 + Vite 6 + Vuetify 3.7 + Pinia 2 SPA
│   └── docs/              # @sess/docs — VitePress 1.6 Bilingual Documentation Portal
├── packages/
│   ├── core/              # @sess/core — Zero-dependency TypeScript business engine & Zod schemas
│   └── api/               # @sess/api — Multi-target Hono.js Edge Gateway (Cloudflare & Node)
├── services/
│   ├── crawler/           # @sess/crawler — Playwright automation scraper & interactive CLI wizard
│   └── e2e/               # @sess/e2e — Visual regression testing baseline & E2E snapshot suite
├── server.js              # Standalone Node.js production runner with SPA fallback
├── turbo.json             # Turborepo caching pipelines & topological dependencies
└── pnpm-workspace.yaml    # Workspace declarations
```

| Workspace | Package Name | Role & Responsibility | Primary Stack |
| :--- | :--- | :--- | :--- |
| `packages/core` | `@sess/core` | Domain models, Zod validation schemas, normalizers, and mathematical conflict engine | TypeScript 5.7, Zod 3, tsup |
| `packages/api` | `@sess/api` | Multi-target Edge API gateway, universal storage adapter (Cloudflare KV + Node.js) | Hono.js, Cloudflare Workers, Node.js |
| `apps/web` | `@sess/web` | Modern client SPA, Saturday–Friday calendar, $O(1)$ fast lookup, reactive clash alerts | Vue 3.5, Vuetify 3.7, Pinia 2, Vite 6 |
| `services/crawler` | `@sess/crawler` | Playwright scraper for Shiraz & Shahrekord portals, interactive CLI wizard, API sync | Playwright, Commander, @clack/prompts |
| `services/e2e` | `@sess/e2e` | Visual regression safety net verifying 5 critical user journeys across all viewports | Playwright, Edge/Chromium |
| `apps/docs` | `@sess/docs` | Bilingual technical documentation portal (Persian RTL `/` and English LTR `/en/`) | VitePress 1.6, Vue 3, Mermaid |

---

## 📦 Comprehensive Module & Package Digest

This section synthesizes the complete architectural and technical specifications documented across each package and the documentation portal.

### 1. Zero-Dependency Business Engine (`@sess/core`)

The foundation of the entire system. Written in pure TypeScript targeting **ES2020**, it compiles to dual **ESM** (`.mjs`) and **CommonJS** (`.js`) bundles without external runtime dependencies (except Zod).

#### Runtime Validation Schemas (`src/schemas/`)
* **`TimeSlotSchema` (`TimeSlot`)**: Encapsulates a weekly class session:
  `{ place: string, day: string, startHour: number, startMinute: number, endHour: number, endMinute: number }`
* **`FinalTimeSplitSchema` (`FinalTimeSplit`)**: Structured exam time interval:
  `{ start_hour: number, start_minute: number, end_hour: number, end_minute: number }`
* **`FinalDateSplitSchema` (`FinalDateSplit`)**: Jalali solar exam date:
  `{ d: number, m: number, y: number }`
* **`CourseSchema` (`Course`)**: Atomic course definition containing composite ID, title, credits (*vahed*), instructor, capacity, weekly time slots, exam schedule, and prerequisite metadata.
* **`SemesterDataSchema` (`SemesterData`)**: Department-grouped nested catalog structure:
  `Record<DepartmentName, Record<CourseCompositeId, Course>>`

#### Conflict Detection Engines (`src/helpers/timeInterference.ts`)
* **Weekly Class Overlap**: Two courses conflict if they share a day and their time windows intersect:
  $$\text{Class Conflict} = (\text{Day}_1 = \text{Day}_2) \land \Big( (S_1 < E_2 \land E_1 > S_2) \lor (S_1 \le S_2 \land E_1 \ge E_2) \Big)$$
* **Final Exam Clashes**: Evaluates Jalali exam dates and hours across courses while safely skipping unscheduled placeholders (`00:00 - 00:00`).

#### Text & Numeral Normalizers (`src/helpers/normalizers.ts`)
* **`arabicToPersian`**: Converts Arabic glyphs (`ك` $\to$ `ک`, `ي` $\to$ `ی`) and Arabic digits (`١...٩` $\to$ `۱...۹`).
* **`toFarsiNumber` / `convertPersianNumToEng`**: Bidirectional conversion between English integers and Persian numeral strings using direct ASCII offset operations.
* **`normalizeDayName`**: Standardizes Persian day strings using Zero-Width Non-Joiner (ZWNJ / نیم‌فاصله) (e.g. `شنبه`, `یک‌شنبه`, `دوشنبه`, `سه‌شنبه`, `چهارشنبه`, `پنج‌شنبه`, `جمعه`).
* **`teacherNameDivider`**: Splits raw portal strings (`LastName*FirstName*Dept*`) into clean display names (`FirstName LastName`).

---

### 2. Feature-First Web Application (`@sess/web`)

Modern reactive client designed with **Vue 3.5 SFCs**, **Composition API (`<script setup lang="ts">`)**, and **Vuetify 3.7**.

```mermaid
graph TD
    subgraph UIModule ["UI & Page Orchestration"]
        App["App.vue (Shell & RTL Locale Provider)"]
        Home["Home.vue (Thin Container Page)"]
    end

    subgraph FeatureSlices ["Feature-First Domain Slices"]
        Courses["features/courses (CourseDataTable, CourseDetailDialog)"]
        Filters["features/filters (FilterDrawer, Ephemeral State)"]
        Timetable["features/timetable (WeeklyCalendar, SelectedTab, ClashModal, ClashSnackbar)"]
    end

    subgraph CoreServices ["State & Business Services"]
        ETL["shared/services/courseDataService.ts (Pure ETL & Search)"]
        CourseStore["store/courseStore.ts (Catalog & Map Index)"]
        TimetableStore["store/timetableStore.ts (Selected Courses & Clash Getters)"]
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

#### Core Architectural Patterns:
* **Feature-First Modularity**: Components are grouped into self-contained slices (`src/features/courses/`, `src/features/filters/`, `src/features/timetable/`). Each feature exports strictly through an `index.ts` barrel file; deep imports are blocked by ESLint.
* **Domain-Driven Pinia 2 Stores**:
  - `useCourseStore`: Manages the full semester catalog, builds an $O(1)$ fast lookup index via `Map<string, Course>`, and exposes deduplicated filter options.
  - `useTimetableStore`: Persists user selections in `localStorage` via `pinia-plugin-persistedstate`. Automatically computes reactive clash getters (`classTimeConflicts`, `finalExamConflicts`, `vahedsSum`) without heavy $O(N^2)$ watchers.
* **Immutable Pure ETL Pipeline (`courseDataService.ts`)**: Executes text normalization, numeral parsing, and multi-criteria pure searching without mutating static datasets.
* **Tri-State Search Rendering**: Explicit UI state machine:
  1. `results.length > 0 && results[0] !== -1`: Display search table rows.
  2. `results[0] === -1`: Display "No courses found" state with reset actions.
  3. Empty array: Initial prompt guiding the user to select department and criteria.
* **Materio Design Tokens & RTL**: Custom Material Design 3 theme system (`vuetify.ts`), dynamic Light/Dark mode switcher, and official Vazirmatn FD webfonts across weights 300 to 800.

---

### 3. Multi-Target Edge API Gateway (`@sess/api`)

Ultrafast, standards-compliant REST gateway built with **Hono.js**. Designed for zero-overhead execution across edge workers and self-hosted containers.

#### Universal Storage Adapter (`src/storage.ts`)
The storage layer dynamically detects its runtime environment:
- **Cloudflare Workers (Edge)**: Reads directly from **Cloudflare KV** (`DATA_KV`), delivering sub-10ms global response times.
- **Node.js (Self-Hosted / Docker)**: Reads from the local filesystem (`data.json`).
- **Isolate Cache**: Both targets benefit from a 60-second in-memory cache to minimize I/O and KV read operations.

#### Layered Cascade Path Resolver (`src/paths.ts`)
To support diverse deployment environments (Monorepo dev, standalone Node runner, and Docker containers), paths to static assets (`apps/web/dist`) and data files are resolved through a deterministic layered cascade:
1. Environment Variable Overrides (`WEB_DIST_PATH`, `DATA_FILE_PATH`).
2. Workspace Root Markers (`pnpm-workspace.yaml`, `turbo.json`).
3. Module & Current Working Directory Fallbacks.

#### Timing-Safe Security
Protected mutation endpoints (`POST /api/sync`) validate authentication tokens using Web Crypto SHA-256 digests and `timingSafeEqual` comparison, eliminating timing side-channel vulnerabilities.

---

### 4. Automated Scraper Pipeline (`@sess/crawler`)

High-resilience crawler and automation service built with **Playwright** and **TypeScript** to extract course schedules from university portals.

* **Human-Like Navigation (`safeClick`)**: Blends Playwright click events with native DOM dispatchers, completely overcoming stale-element errors on university dropdown cascades.
* **3-Tier Exponential Backoff**: Automatically recovers from network hiccups, portal timeouts, and slow server responses with automated retries.
* **Interactive Terminal Wizard (`prompt.ts`)**: Terminal wizard built with `@clack/prompts` allowing users to select semesters, browse departments, and choose output destinations.
* **Direct Cloud Sync**: The `--sync` flag validates scraped tables via `@sess/core` and streams JSON directly to `POST /api/sync` on Cloudflare or Node.js.

---

### 5. Visual Regression Baseline (`@sess/e2e`)

Playwright automation suite verifying 100% GUI integrity, preventing layout shifts and RTL clipping during refactoring:

* **Journey 1**: Desktop course search, table pagination, and summary chips (`01_search_results_desktop`).
* **Journey 2**: Saturday–Friday weekly schedule grid and popovers (`02_calendar_schedule`).
* **Journey 3**: Real-time clash snackbar and side-by-side comparison modal (`03_clash_snackbar_and_modal`).
* **Journey 4**: Comprehensive course specification dialog (`04_course_details_modal`).
* **Journey 5**: Mobile responsiveness on 375px viewports (`05_mobile_drawer`, `05_mobile_table_stacked`).

---

### 6. Bilingual Documentation Portal (`@sess/docs`)

Built with **VitePress 1.6** and **Vue 3**:
* **Persian RTL by Default (`/`)**: Tailored with Vazirmatn FD typography and custom RTL navigation styles.
* **English LTR (`/en/`)**: Complete English mirror with language switcher.
* **Interactive Mermaid Diagrams**: Embedded zoom, pan, fit-to-screen, and fullscreen controls for architectural workflows.
* **Instant Local Fuzzy Search**: In-browser search supporting both Persian and English queries.

---

## 📡 REST API Reference

All endpoints are served under the `/api` prefix:

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Returns runtime environment, version, and server timestamp | No |
| `GET` | `/api/departments` | Returns list of all academic departments present in dataset | No |
| `GET` | `/api/courses` | Search & filter courses by `department`, `query`, `teacher`, `day`, `limit` | No |
| `GET` | `/api/courses/:id` | Fetch single course specification by composite identifier | No |
| `POST` | `/api/sync` | Push complete scraped semester dataset (`SemesterDataSchema`) | Bearer / `X-Sync-Token` |

### Sample Requests & Responses

#### Health Check (`GET /api/health`)
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

#### Search Courses (`GET /api/courses?department=Computer&limit=2`)
```http
GET /api/courses?department=Computer&limit=2 HTTP/1.1
```
```json
{
  "count": 2,
  "courses": [
    {
      "id": "290331041^1",
      "course": "Advanced Programming",
      "vahed": 3,
      "teacher": "Khayyam Salehi",
      "group": "Group 1",
      "faculty": "Faculty of Mathematics",
      "department": "Department of Computer Engineering & IT",
      "capacity": 40,
      "final": "1405/03/25 (10:30 - 12:30)",
      "classes": [
        { "day": "شنبه", "place": "Site 201", "startHour": 13, "startMinute": 30, "endHour": 14, "endMinute": 30 },
        { "day": "یک‌شنبه", "place": "Room 201", "startHour": 8, "startMinute": 30, "endHour": 10, "endMinute": 30 }
      ]
    }
  ]
}
```

#### Sync Dataset (`POST /api/sync`)
```http
POST /api/sync HTTP/1.1
Authorization: Bearer your_strong_secret_token
Content-Type: application/json

{
  "Department of Computer Engineering": {
    "290331041^1": { /* Course Object */ }
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

## ⚙️ Configuration & Environment Variables

| Variable | Location | Purpose | Default |
| :--- | :--- | :--- | :--- |
| `PORT` | Node Runner / `.env` | HTTP listening port for unified server | `3000` |
| `SYNC_TOKEN` | API / `.dev.vars` | Cryptographic secret for `POST /api/sync` | *Required in Prod* |
| `WEB_DIST_PATH` | API / `.env` | Explicit path override to compiled SPA bundle | Auto-resolved |
| `DATA_FILE_PATH` | API / `.env` | Explicit path override to catalog JSON | Auto-resolved |
| `SESS_URL` | Crawler / `.env` | Target portal URL (e.g. `https://sess.sku.ac.ir/`) | *Required* |
| `SESS_USERNAME` | Crawler / `.env` | University student / staff username | *Required* |
| `SESS_PASSWORD` | Crawler / `.env` | University portal password | *Required* |
| `SEMESTER_VALUE` | Crawler / `.env` | Target semester code (e.g. `4031`) | Optional |
| `HEADLESS` | Crawler / `.env` | Run browser automation in background | `true` |

---

## 🚀 Quick Start & Development Workflow

### Prerequisites
* **Node.js**: `v20.x` or higher (LTS recommended)
* **pnpm**: `v11.x` or higher (`corepack enable pnpm`)
* **Git**

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/rashcode-com/Sess-Timetabling-App.git
cd Sess-Timetabling-App

# Install dependencies across all monorepo packages
pnpm install
```

### 2. Running Development Services
```bash
# Run all workspace dev services in parallel via Turborepo
pnpm dev

# --- Or run individual components ---

# Start Vue 3 Web Application (http://localhost:8081)
pnpm web:serve

# Start Cloudflare Wrangler API simulation (http://localhost:8787)
pnpm api:dev
# Or run API directly in Node.js dev mode:
pnpm --filter @sess/api dev:node

# Start VitePress Documentation Portal (http://localhost:5180)
pnpm docs:dev

# Launch Interactive Crawler CLI Wizard
pnpm crawler:dev
```

### 3. Testing & Quality Assurance
```bash
# Type-check Vue 3 SFCs and TypeScript across packages
pnpm --filter @sess/web type-check

# Run unit tests for ETL normalizers, Pinia stores, and conflict engines (TSX)
pnpm --filter @sess/web test

# Run crawler parser and regex unit tests
pnpm --filter @sess/crawler test

# Run visual regression baseline tests via Playwright
pnpm e2e:baseline
```

---

## 🌐 Production Deployment Options

```
                    ┌───────────────────────────────┐
                    │      Deployment Strategy      │
                    └───────┬───────────────┬───────┘
                            │               │
            ┌───────────────▼──────┐ ┌──────▼────────────────┐
            │ Standalone Node.js   │ │ Serverless Edge       │
            │ (VPS / Docker)       │ │ (Cloudflare Workers)  │
            └──────────────────────┘ └───────────────────────┘
```

### Option 1: Standalone Node.js Runner (VPS / Docker)
The unified server runner ([server.js](file:///e:/Projects/Sess-Timetabling-App/server.js)) dynamically imports `@sess/api` and serves both the REST API and the compiled Vue SPA bundle on a single port:

```bash
# 1. Compile all packages via Turborepo
pnpm build

# 2. Launch production server
PORT=3000 NODE_ENV=production pnpm start
```

#### Process Management with PM2:
```bash
npm install -g pm2
pm2 start server.js --name "sess-app" -i max
pm2 save
pm2 startup
```

### Option 2: Cloudflare Workers Edge Deployment
Deploy the Hono API gateway globally with Cloudflare Workers Assets serving static web files:

```bash
# 1. Authenticate with Cloudflare
pnpm dlx wrangler login

# 2. Create KV namespace and seed catalog data
pnpm dlx wrangler kv namespace create DATA_KV
pnpm kv:seed

# 3. Deploy Worker and assets
pnpm --filter @sess/api deploy
```

---

## 🗺️ Project Roadmap

- [x] **Phase 1**: Monorepo Initialization (`pnpm workspaces` + `turborepo`).
- [x] **Phase 2**: `@sess/core` Pure Engine Extraction (TS + Zod schemas + mathematical clash detectors).
- [x] **Phase 3**: Edge API Gateway (`@sess/api` multi-target Hono.js on Cloudflare Workers & Node.js).
- [x] **Phase 4**: Automated Scraper Pipeline (`@sess/crawler` Playwright automation with CLI wizard).
- [x] **Phase 5**: Full Frontend Modernization (`@sess/web` Vue 3.5, Vuetify 3.7, Pinia 2, Feature-First).

---

## 🍴 Fork & Independent Development

This project is provided as a complete, stable, and self-contained reference system. If you wish to adapt the crawler for other universities, modify the interface, or extend features for your own academic institution:

1. **Fork the Repository**: Create an independent fork under your personal or organizational GitHub account.
2. **Customize & Maintain**: Adjust portal scraping selectors in `@sess/crawler`, configure environment variables, or tailor themes in `@sess/web` to fit your campus infrastructure.
3. **Deploy Independently**: Maintain your own deployment pipelines using Cloudflare Workers, Docker, or static hosting following the [Deployment Guide](./apps/docs/deployment/guide.md).

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
  <br />
  <sub>Designed and engineered with passion for university students and the open-source community.</sub>
</div>
