# Quick Start & Setup Guide

This guide walks you through system prerequisites, repository setup, and running development environments for the **Sess-Timetabling-App** monorepo.

---

## 1. System Prerequisites

Before getting started, verify the following tools are installed on your environment:

* **Node.js**: `v20.x` or higher (LTS release recommended)
* **pnpm**: `v11.x` or higher (Official package manager)
  ```bash
  # Enable and activate the latest pnpm release via Corepack
  corepack enable
  corepack prepare pnpm@latest --activate
  ```
* **Git**: Latest stable release

> [!CAUTION]
> This repository is structured as a **Core-First Monorepo** managed with **pnpm workspaces** and **Turborepo**. Never execute `npm install` or `yarn install`, as doing so will corrupt workspace symlinks and caching pipelines.

---

## 2. Clone & Installation

Clone the repository and install all workspace dependencies across all applications and packages with a single root command:

```bash
# Clone the repository
git clone https://github.com/rashcode-com/Sess-Timetabling-App.git
cd Sess-Timetabling-App

# Install all workspace dependencies
pnpm install
```

The installation command automatically links the `@sess/core` package to consuming apps and configures caching layers.

---

## 3. Running Development Servers

You can launch all monorepo services concurrently or run individual services depending on your development scope:

### A) Run All Workspace Services Concurrently (Turborepo)
```bash
pnpm dev
```
Starts `@sess/web`, `@sess/docs`, `@sess/api`, and watches `@sess/core` in parallel.

---

### B) Web Application Frontend (`@sess/web`)
The client SPA runs on a fast **Vite 6** dev server:
* **Local URL:** `http://localhost:8081`

```bash
pnpm web:serve
# Or via workspace filter:
pnpm --filter @sess/web dev
```

---

### C) API Gateway (`@sess/api`)

* **Cloudflare Workers Simulation via Wrangler (Recommended):**
  ```bash
  pnpm api:dev
  ```
  Spins up the edge worker runtime at `http://localhost:8787`.

* **Standalone Node.js Server:**
  ```bash
  pnpm --filter @sess/api dev:node
  ```

* **Seed Semester Dataset to Cloudflare KV:**
  ```bash
  pnpm kv:seed
  ```

---

### D) VitePress Documentation Portal (`@sess/docs`)
Launches the bilingual VitePress documentation portal:
* **Local URL:** `http://localhost:5180`

```bash
pnpm docs:dev
```

---

### E) Portal Scraper Service (`@sess/crawler`)
* **Interactive Terminal Wizard:**
  ```bash
  pnpm crawler:dev
  ```
* **Or direct scrape for a specific department in headless mode:**
  ```bash
  pnpm --filter @sess/crawler dev -- -d 32 --headless
  ```

---

## 4. Testing & Quality Assurance

Maintain codebase health and prevent regressions using the dedicated test commands:

```bash
# 1. Type-check Vue 3 SFCs and TypeScript across packages
pnpm --filter @sess/web type-check

# 2. Run unit tests for data ETL, Pinia stores, and conflict algorithms (TSX)
pnpm --filter @sess/web test

# 3. Run unit tests for crawler parser and normalizers
pnpm --filter @sess/crawler test

# 4. Capture and verify visual regression baselines with Playwright
pnpm e2e:baseline
```

---

## 5. Compiling for Production (Build Pipeline)

To compile and bundle all packages according to the Turborepo dependency graph:

```bash
pnpm build
```

Build outputs:
* Static web bundle: `apps/web/dist`
* Edge & Node API bundles: `packages/api/dist`
* Core shared logic: `packages/core/dist`
* Documentation static build: `apps/docs/.vitepress/dist`

To serve both frontend and API from a unified Node.js runner:
```bash
PORT=3000 NODE_ENV=production pnpm start
```
The application will be accessible at `http://localhost:3000`.
