# KRM Design

A multilingual portfolio & design studio built with **Next.js** (App Router) and a custom **Node.js** backend.

🌐 **Live:** [krmdesign.vercel.app](https://krmdesign.vercel.app)

---

## ✨ Features

- **Interactive 3D World Map** — explore projects geographically with zoom & rotate
- **Physics-Based Animations** — canvas-driven visual effects and custom cursor
- **Gallery System** — desktop & mobile-optimised image galleries with zoom, swipe & drag
- **Dark/Light Theme** — Pantone-inspired dynamic theming based on the year's color of the year
- **7 Languages** — English, Turkish, Spanish, German, French, Norwegian Bokmål & Italian
- **Admin Panel** — full CMS with drag-and-drop ordering, image upload (auto WebP conversion), drafts, trash & version conflict detection
- **SEO Ready** — sitemap, robots.txt, Open Graph metadata

## 🏗️ Architecture

```
├── frontend/          # Next.js 15 App Router (React, Tailwind CSS v4, shadcn/ui)
│   ├── app/           # Pages, layouts, API proxy, metadata
│   ├── components/    # UI components, gallery, admin panel, 3D world
│   ├── lib/           # Translations, data fetching, state management
│   └── public/        # Static assets
├── backend/           # Custom Node.js HTTP server
│   ├── src/           # API, auth, SQLite, image processing (Sharp)
│   └── tests/         # API integration tests
└── scripts/           # Dev/prod runners, smoke tests
```

The frontend proxies all `/api/*` requests to the backend. The browser never connects directly to the backend port.

## 🚀 Quick Start

**Prerequisites:** Node.js ≥ 24.x, npm

```bash
# Clone the repo
git clone https://github.com/KeremCanKuru22/krm-design.git
cd krm-design

# Install dependencies
npm ci

# Set up admin credentials
npm run admin:setup

# Build & start
npm run build
npm start
```

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Portfolio site |
| `http://localhost:3000/admin` | Admin panel |

### Development

```bash
npm run dev          # Starts both frontend & backend with hot reload
```

Or run them separately:

```bash
npm run dev --workspace backend
npm run dev --workspace frontend
```

### Testing

```bash
npm test             # Backend API tests
npm run test:smoke   # Production smoke tests (requires build)
```

## ⚙️ Environment Variables

Default localhost setup requires no configuration. To customise, copy the example files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

| Variable | Default | Description |
|----------|---------|-------------|
| `BACKEND_PORT` | `4000` | Backend port |
| `BACKEND_HOST` | `127.0.0.1` | Backend listen address |
| `PUBLIC_ORIGIN` | `http://localhost:3000` | Public-facing origin (no trailing `/`) |
| `DATA_DIR` | `data` | Data directory relative to backend |
| `BACKEND_URL` | `http://127.0.0.1:4000` | Backend address for Next.js server |

> [!NOTE]
> `localhost` and `127.0.0.1` are different origins. Use `http://localhost:3000` for local development. For production with a domain, set `PUBLIC_ORIGIN=https://yourdomain.com`.

## 🗄️ Data & Backups

- Database: `backend/data/portfolio.sqlite` (created on first run)
- Uploaded media: `backend/data/media/` (original + WebP variants)
- To back up: stop services, copy the entire `backend/data/` directory

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| UI | React, Tailwind CSS v4, shadcn/ui |
| Language | JavaScript / JSX |
| Backend | Node.js (custom HTTP server) |
| Database | SQLite |
| Image Processing | Sharp |
| Validation | Zod |
| Font | Outfit (Google Fonts) |

## 📄 License

[MIT](LICENSE) © Kerem Can Kuru
