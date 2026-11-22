# KRM Design

<p align="center">
  <strong>Multilingual Design Portfolio & CMS</strong><br>
  Built with Next.js (App Router), custom Node.js HTTP Backend & SQLite.
</p>

<p align="center">
  <a href="https://krmdesign.vercel.app"><img src="https://img.shields.io/badge/Live_Demo-krmdesign.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo"></a>
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/SQLite-WAL_Mode-003B57?style=for-the-badge&logo=sqlite" alt="SQLite">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="MIT License">
</p>

---

## ✨ Features

- **🌐 Interactive 3D World** — Geographically explore football & design projects on a zoomable, draggable 3D globe.
- **⚡ Physics & Motion** — Matter/canvas-driven interactive physical particles, custom cursor, and retro elements.
- **🖼️ Advanced Gallery System** — Mobile swipeable card stacks and responsive desktop galleries with fluid zoom & inspect.
- **🎨 Dynamic Pantone Theming** — Theme shifts reflecting Pantone Color of the Year palettes with dark/light mode toggle.
- **🌍 7 Built-in Languages** — English, Turkish, Spanish, German, French, Norwegian Bokmål, and Italian.
- **🛡️ Secure Admin CMS** — Full project management with drag-and-drop ordering, optimistic revision concurrency control, automatic Sharp WebP conversion (multi-res), draft/trash states, and honeypot-protected inquiry handling.
- **🔍 SEO & Metadata** — Dynamic sitemap generator, `robots.txt`, Open Graph cards, and structured headers.

---

## 🏗️ Architecture

```
krm-design/
├── frontend/                     # Next.js App Router (React 19, Tailwind CSS v4)
│   ├── app/                      # Pages, layouts, metadata & proxy routes
│   │   ├── about/                # Studio manifesto & profile
│   │   ├── admin/                # Secure CMS dashboard & login
│   │   ├── api/[...path]/        # Next.js proxy route to backend
│   │   ├── contact/              # Interactive inquiry form
│   │   ├── info/                 # FAQ & terms
│   │   ├── projects/[slug]/      # Case study detail pages
│   │   ├── random/               # Random showcase redirector
│   │   └── world/                # Fullscreen 3D globe visualization
│   ├── components/               # Custom UI, physics canvas, 3D world & galleries
│   │   └── ui/                   # shadcn/ui primitives
│   ├── lib/                      # Translations (i18n), store & utilities
│   └── public/                   # Vector assets, favicon & geo data
├── backend/                      # Standalone Node.js HTTP Server
│   ├── src/
│   │   ├── routes/               # Modular API routes
│   │   │   ├── auth.js           # Session auth, scrypt, rate limiting
│   │   │   ├── projects.js       # CRUD, revision locking, ordering
│   │   │   ├── media.js          # Sharp image processing & private uploads
│   │   │   ├── inquiries.js      # Contact requests & honeypot filtering
│   │   │   └── settings.js       # Global CMS settings
│   │   ├── app.js                # Core HTTP router & strict origin enforcement
│   │   ├── config.js             # Environment & persistent storage validation
│   │   ├── database.js           # SQLite setup, WAL mode & migrations
│   │   ├── seed.js               # Initial portfolio showcase data
│   │   ├── server.js             # HTTP server entrypoint
│   │   └── setup-admin.js        # CLI wizard for admin account creation
│   └── tests/
│       └── api.test.js           # 16 automated integration tests
├── scripts/
│   ├── run.js                    # Dual workspace dev & start runner
│   ├── smoke-test.js             # 17 end-to-end production integration checks
│   └── generate.js               # Country i18n data generator
└── .github/workflows/
    └── ci.yml                    # Automated build & test pipeline
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js ≥ 24.x**
- **npm ≥ 10.x**

```bash
# 1. Clone repository
git clone https://github.com/keremckuru/krm-design.git
cd krm-design

# 2. Install workspace dependencies
npm ci

# 3. Create your secure admin account (hidden prompt)
npm run admin:setup

# 4. Start local development server
npm run dev
```

The app will start locally at port `3000`.

> [!TIP]
> To view the live deployment without running it locally, visit **[krmdesign.vercel.app](https://krmdesign.vercel.app)**.

---

## 🧪 Testing & Verification

The project includes unit, integration, and full production smoke tests:

```bash
# Run backend API integration tests (16 tests: auth, CRUD, CORS, revisions, media)
npm test

# Run full production smoke test (17 checks: real servers, proxy, auth cookies, SSR)
npm run test:smoke
```

---

## ⚙️ Configuration & Environment

For local development, sensible defaults work out of the box without extra files.

To customize for staging or production:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### Backend (`backend/.env`)
| Variable | Default | Description |
|---|---|---|
| `BACKEND_PORT` | `4000` | Port the backend HTTP server listens on |
| `BACKEND_HOST` | `127.0.0.1` | Network interface to bind |
| `PUBLIC_ORIGIN` | `http://localhost:3000` | Main frontend URL (exact match for CSRF/Origin validation) |
| `ALLOWED_ORIGINS` | _(empty)_ | Comma-separated list of extra allowed origins (e.g. `https://krmdesign.vercel.app`) |
| `DATA_DIR` | `data` | Directory for SQLite DB and uploaded media (**must be persistent volume**) |

### Frontend (`frontend/.env.local`)
| Variable | Default | Description |
|---|---|---|
| `BACKEND_URL` | `http://127.0.0.1:4000` | Address used by Next.js server-side proxy to reach backend |

---

## 🔒 Security & Data Persistence

1. **Origin Verification (CORS/CSRF Protection):** Mutating requests (`POST`, `PATCH`, `DELETE`) require an `Origin` header strictly matching `PUBLIC_ORIGIN`, `ALLOWED_ORIGINS`, or local loopback. Subdomain wildcards are intentionally disallowed.
2. **Strict Session Auth:** Passwords hashed with `scrypt` using per-user salts. Sessions are stored as SHA-256 tokens in `HttpOnly; SameSite=Strict; Secure` cookies.
3. **Optimistic Concurrency Control:** Every project and setting carries an incremental `revision` counter. Simultaneous edits trigger a 409 Conflict instead of silent data overwrites.
4. **Persistent Database Storage:**
   - In cloud environments (Render, Railway, Fly.io, VPS), mount a **persistent disk** to `DATA_DIR` (e.g., `/var/data`).
   - The server warns automatically at startup if `DATA_DIR` points to an ephemeral directory like `/tmp`.
   - Backup: Simply back up the `DATA_DIR` folder (contains `portfolio.sqlite` and `media/`).

---

## 📄 License

Licensed under the [MIT License](LICENSE).  
Copyright (c) 2026 Kerem Can Kuru.
