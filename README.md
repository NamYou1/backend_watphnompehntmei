# Wat Phnom Penh Tmei — Node.js Backend API

REST API for the Wat Phnom Penh Tmei temple website. Built with **Node.js + Express + TypeScript + PostgreSQL**.

---

## Tech Stack

| Layer       | Technology                    |
|-------------|-------------------------------|
| Runtime     | Node.js                       |
| Language    | TypeScript 5.x                |
| Framework   | Express 4.x                   |
| Database    | PostgreSQL (via `pg` pool)    |
| API Docs    | Swagger UI (`swagger-jsdoc`)  |
| Dev Server  | ts-node-dev                   |

---

## Project Structure

```
src/
├── app.ts                    # Express entry point
├── migrate.ts                # CLI migration runner
├── config/
│   ├── database.ts           # pg Pool singleton
│   └── swagger.ts            # OpenAPI spec builder
├── migrations/
│   ├── 001_functions_and_schema.ts   # Tables, views, functions
│   └── 002_seed_data.ts              # Seed data
├── middleware/
│   └── errorHandler.ts
├── routes/
│   ├── index.ts
│   ├── categories.routes.ts
│   ├── authors.routes.ts
│   ├── monks.routes.ts
│   ├── activities.routes.ts
│   ├── activityPhotos.routes.ts
│   ├── articles.routes.ts
│   ├── templeHistory.routes.ts
│   ├── headerNav.routes.ts
│   ├── footer.routes.ts
│   └── contactInfo.routes.ts
├── types/
│   └── index.ts              # TypeScript interfaces for all DB tables
└── utils/
    └── queryHelpers.ts       # Pagination, sort, search helpers
```

---

## Getting Started

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Copy `.env.example` to `.env` and edit as needed:

```bash
cp .env.example .env
```

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=db_wat
DB_USER=postgres
DB_PASSWORD=123
```

### 4. Create the database

Connect to PostgreSQL and run:

```sql
CREATE DATABASE db_wat ENCODING 'UTF8' TEMPLATE template0;
```

### 5. Run migrations

```bash
npm run migrate
```

Other migration commands:

```bash
npm run migrate:rollback   # Roll back all migrations
npm run migrate:status     # Show migration status
```

### 6. Start development server

```bash
npm run dev
```

### 7. Build & start production

```bash
npm run build
npm start
```

---

## API Documentation

Swagger UI is available at:

```
http://localhost:3000/api-docs
```

Raw OpenAPI JSON:

```
http://localhost:3000/api-docs.json
```

---

## Pagination, Search & Sort

All list endpoints (`GET /`) support these query parameters:

| Parameter | Type    | Default | Description                            |
|-----------|---------|---------|----------------------------------------|
| `page`    | integer | `1`     | Page number (1-based)                  |
| `limit`   | integer | `20`    | Items per page (max `100`)             |
| `search`  | string  | —       | Case-insensitive search across text columns |
| `sort`    | string  | varies  | Column name to sort by                 |
| `order`   | string  | `desc`  | Sort direction: `asc` or `desc`        |

**Response shape:**

```json
{
  "data": [ ... ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## API Endpoints

Base URL: `http://localhost:3000/api`

### Health Check

| Method | Path      | Description      |
|--------|-----------|------------------|
| GET    | `/health` | Server heartbeat |

---

### Categories — `/api/categories`

> Sortable columns: `id`, `name`, `name_km`, `slug`, `created_at`

| Method | Path                  | Description           | Paginated |
|--------|-----------------------|-----------------------|-----------|
| GET    | `/api/categories`     | List all categories   | ✅        |
| GET    | `/api/categories/:id` | Get category by ID    |           |
| POST   | `/api/categories`     | Create category       |           |
| PUT    | `/api/categories/:id` | Update category       |           |
| DELETE | `/api/categories/:id` | Delete category       |           |

**Search fields:** `name`, `name_km`, `slug`

**Example:**
```
GET /api/categories?page=1&limit=10&search=ព្រះ&sort=name&order=asc
```

---

### Authors — `/api/authors`

> Sortable columns: `id`, `name`, `name_km`, `email`, `created_at`

| Method | Path               | Description        | Paginated |
|--------|--------------------|--------------------|-----------|
| GET    | `/api/authors`     | List all authors   | ✅        |
| GET    | `/api/authors/:id` | Get author by ID   |           |
| POST   | `/api/authors`     | Create author      |           |
| PUT    | `/api/authors/:id` | Update author      |           |
| DELETE | `/api/authors/:id` | Delete author      |           |

**Search fields:** `name`, `name_km`, `email`, `bio`

---

### Monks — `/api/monks`

> Sortable columns: `id`, `name`, `name_km`, `title`, `join_year`, `left_year`, `created_at`

| Method | Path                  | Description                      | Paginated |
|--------|-----------------------|----------------------------------|-----------|
| GET    | `/api/monks`          | List all monks                   | ✅        |
| GET    | `/api/monks/active`   | List currently active monks      | ✅        |
| GET    | `/api/monks/:id`      | Get monk by ID                   |           |
| POST   | `/api/monks`          | Create monk                      |           |
| PUT    | `/api/monks/:id`      | Update monk                      |           |
| DELETE | `/api/monks/:id`      | Delete monk                      |           |

**Search fields:** `name`, `name_km`, `title`, `title_km`, `bio`

**Example:**
```
GET /api/monks/active?sort=join_year&order=asc
GET /api/monks?search=bhikkhu&page=1&limit=10
```

---

### Activities — `/api/activities`

> Sortable columns: `id`, `title`, `title_km`, `event_year`, `created_at`

| Method | Path                     | Description                            | Paginated |
|--------|--------------------------|----------------------------------------|-----------|
| GET    | `/api/activities`        | List all activities                    | ✅        |
| GET    | `/api/activities/full`   | List with category name (view)         | ✅        |
| GET    | `/api/activities/:id`    | Get activity by ID                     |           |
| POST   | `/api/activities`        | Create activity                        |           |
| PUT    | `/api/activities/:id`    | Update activity                        |           |
| DELETE | `/api/activities/:id`    | Delete activity                        |           |

**Search fields:** `title`, `title_km`, `description`, `description_km`

**Example:**
```
GET /api/activities/full?page=1&limit=5&search=festival&sort=event_year&order=desc
```

---

### Activity Photos — `/api/activity-photos`

| Method | Path                          | Description                       |
|--------|-------------------------------|-----------------------------------|
| GET    | `/api/activity-photos`        | List photos (filter by `?activityId=`) |
| GET    | `/api/activity-photos/:id`    | Get photo by ID                   |
| POST   | `/api/activity-photos`        | Add photo                         |
| PUT    | `/api/activity-photos/:id`    | Update photo                      |
| DELETE | `/api/activity-photos/:id`    | Delete photo                      |

**Example (get all photos for activity 3):**
```
GET /api/activity-photos?activityId=3
```

---

### Articles — `/api/articles`

> Sortable columns: `id`, `title`, `title_km`, `published_date`, `read_time`, `created_at`

| Method | Path                    | Description                         | Paginated |
|--------|-------------------------|-------------------------------------|-----------|
| GET    | `/api/articles`         | List all articles                   | ✅        |
| GET    | `/api/articles/full`    | List with category & author (view)  | ✅        |
| GET    | `/api/articles/:id`     | Get article by ID                   |           |
| POST   | `/api/articles`         | Create article                      |           |
| PUT    | `/api/articles/:id`     | Update article                      |           |
| DELETE | `/api/articles/:id`     | Delete article                      |           |

**Search fields:** `title`, `title_km`, `excerpt`, `excerpt_km`

**Example:**
```
GET /api/articles/full?page=1&limit=10&sort=published_date&order=desc
```

---

### Temple History — `/api/temple-history`

> Sortable columns: `id`, `history_year`, `title_en`, `title_km`, `sort_order`

| Method | Path                         | Description                | Paginated |
|--------|------------------------------|----------------------------|-----------|
| GET    | `/api/temple-history`        | List all timeline entries  | ✅        |
| GET    | `/api/temple-history/:id`    | Get entry by ID            |           |
| POST   | `/api/temple-history`        | Create entry               |           |
| PUT    | `/api/temple-history/:id`    | Update entry               |           |
| DELETE | `/api/temple-history/:id`    | Delete entry               |           |

**Search fields:** `title_en`, `title_km`, `description_en`, `description_km`

**Example:**
```
GET /api/temple-history?sort=history_year&order=asc
```

---

### Header Navigation — `/api/header-nav`

| Method | Path                     | Description          |
|--------|--------------------------|----------------------|
| GET    | `/api/header-nav`        | List all nav items   |
| GET    | `/api/header-nav/:id`    | Get nav item by ID   |
| POST   | `/api/header-nav`        | Create nav item      |
| PUT    | `/api/header-nav/:id`    | Update nav item      |
| DELETE | `/api/header-nav/:id`    | Delete nav item      |

---

### Footer — `/api/footer`

| Method | Path                           | Description                    |
|--------|--------------------------------|--------------------------------|
| GET    | `/api/footer`                  | Full footer view (joined)      |
| GET    | `/api/footer/sections`         | List all footer sections       |
| GET    | `/api/footer/sections/:id`     | Get section by ID              |
| POST   | `/api/footer/sections`         | Create section                 |
| PUT    | `/api/footer/sections/:id`     | Update section                 |
| DELETE | `/api/footer/sections/:id`     | Delete section                 |
| GET    | `/api/footer/links`            | List all footer links          |
| GET    | `/api/footer/links/:id`        | Get link by ID                 |
| POST   | `/api/footer/links`            | Create link                    |
| PUT    | `/api/footer/links/:id`        | Update link                    |
| DELETE | `/api/footer/links/:id`        | Delete link                    |

**Frontend usage (full footer in one call):**
```
GET /api/footer
```

---

### Contact Info — `/api/contact-info`

| Method | Path                        | Description                |
|--------|-----------------------------|----------------------------|
| GET    | `/api/contact-info`         | List all contact entries   |
| GET    | `/api/contact-info/:key`    | Get entry by `info_key`    |
| POST   | `/api/contact-info`         | Create entry               |
| PUT    | `/api/contact-info/:key`    | Update entry               |
| DELETE | `/api/contact-info/:key`    | Delete entry               |

**Known keys (seeded):** `address`, `phone`, `email`, `facebook`, `youtube`, `google_maps_url`, `open_hours`, `open_hours_km`

**Example:**
```
GET /api/contact-info/phone
GET /api/contact-info/facebook
```

---

## Frontend Fetch Examples (JavaScript / TypeScript)

```ts
const BASE = 'http://localhost:3000/api';

// ── Header nav (for navbar component)
const nav = await fetch(`${BASE}/header-nav`).then(r => r.json());

// ── Active monks (paginated)
const monks = await fetch(`${BASE}/monks/active?page=1&limit=20`).then(r => r.json());
// monks.data  → array of monks
// monks.pagination.totalPages

// ── Activities with category (paginated + search)
const activities = await fetch(
  `${BASE}/activities/full?page=1&limit=6&sort=event_year&order=desc`
).then(r => r.json());

// ── Articles with author + category (paginated + search)
const articles = await fetch(
  `${BASE}/articles/full?page=1&limit=9&sort=published_date&order=desc`
).then(r => r.json());

// ── Temple history timeline (sorted by year)
const history = await fetch(
  `${BASE}/temple-history?sort=history_year&order=asc`
).then(r => r.json());

// ── Contact info (all at once)
const contact = await fetch(`${BASE}/contact-info`).then(r => r.json());

// ── Footer (sections + links in one call)
const footer = await fetch(`${BASE}/footer`).then(r => r.json());

// ── Photos for a specific activity
const photos = await fetch(`${BASE}/activity-photos?activityId=1`).then(r => r.json());
```

---

## Database Schema Overview

| Table              | Description                             |
|--------------------|-----------------------------------------|
| `categories`       | Article / activity categories           |
| `authors`          | Article authors                         |
| `monks`            | Monk profiles                           |
| `activities`       | Temple events / activities              |
| `activity_photos`  | Photos linked to activities             |
| `articles`         | News / blog articles                    |
| `temple_history`   | Historical timeline entries             |
| `header_nav`       | Navigation menu items                   |
| `footer_sections`  | Footer column headings                  |
| `footer_links`     | Links inside footer sections            |
| `contact_info`     | Key-value contact information           |

**Database views (for joined data):**

| View             | Description                            |
|------------------|----------------------------------------|
| `v_active_monks` | Monks where `left_year IS NULL`        |
| `v_activities`   | Activities joined with category name   |
| `v_articles`     | Articles joined with category + author |
| `v_footer`       | Footer links joined with section title |
