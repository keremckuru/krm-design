# KRM Design

A multilingual design portfolio & CMS built with **Next.js** (App Router) and a custom **Node.js** backend.

🌐 **Live:** [krmdesign.vercel.app](https://krmdesign.vercel.app)

---

## ✨ Highlights

- **Interactive 3D World** — explore projects on a rotatable, zoomable globe
- **Physics Animations** — canvas-driven particle effects with custom cursor
- **Gallery System** — desktop & mobile-optimised with pinch-to-zoom, swipe & drag
- **Pantone Theming** — dynamic color palette based on the Pantone Color of the Year
- **7 Languages** — EN · TR · ES · DE · FR · NB · IT
- **Full CMS** — admin panel with drag-and-drop ordering, image upload (auto WebP), drafts, trash & conflict detection
- **SEO Ready** — dynamic sitemap, robots.txt, Open Graph metadata

## 🏗️ Project Structure

```
krm-design/
├── frontend/                 # Next.js App Router
│   ├── app/                  # Pages & layouts
│   │   ├── about/            # About page
│   │   ├── admin/            # Admin panel & login
│   │   ├── api/              # API proxy to backend
│   │   ├── contact/          # Contact / inquiry form
│   │   ├── info/             # Info page
│   │   ├── projects/         # Project listing & detail ([slug])
│   │   ├── random/           # Random project redirect
│   │   └── world/            # Interactive 3D world map
│   ├── components/           # React components
│   │   └── ui/               # shadcn/ui primitives
│   ├── lib/                  # Utilities, translations, data fetching
│   ├── public/               # Static assets (favicon, icons)
│   └── vendor/               # Vendored CSS (shadcn/tailwind)
├── backend/                  # Custom Node.js HTTP server
│   ├── src/                  # API, auth, SQLite, image processing
│   └── tests/                # Integration tests
└── scripts/                  # Dev/prod runners & smoke tests
```

## 🚀 Getting Started

**Prerequisites:** Node.js ≥ 24, npm

```bash
git clone https://github.com/keremckuru/krm-design.git
cd krm-design
npm ci
npm run admin:setup    # Create your admin account
npm run build
npm start
```

Open [localhost:3000](http://localhost:3000) in your browser.

### Development

```bash
npm run dev            # Start frontend + backend with hot reload
```

### Testing

```bash
npm test               # Backend integration tests
npm run test:smoke     # End-to-end production smoke tests (requires build)
```

## ⚙️ Configuration

No configuration needed for local development. To customise:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

| Variable | Default | Description |
|----------|---------|-------------|
| `BACKEND_PORT` | `4000` | Backend listen port |
| `BACKEND_HOST` | `127.0.0.1` | Backend bind address |
| `PUBLIC_ORIGIN` | `http://localhost:3000` | Public-facing origin (no trailing `/`) |
| `DATA_DIR` | `data` | Data directory (relative to `backend/`) |
| `BACKEND_URL` | `http://127.0.0.1:4000` | Backend address for Next.js proxy |

## 🛠️ Tech Stack

| | Technology |
|---|-----------|
| **Framework** | [Next.js](https://nextjs.org) (App Router) |
| **UI** | [React](https://react.dev), [Tailwind CSS](https://tailwindcss.com) v4, [shadcn/ui](https://ui.shadcn.com) |
| **Backend** | Node.js (custom HTTP server) |
| **Database** | [SQLite](https://sqlite.org) |
| **Image Processing** | [Sharp](https://sharp.pixelplumbing.com) |
| **Validation** | [Zod](https://zod.dev) |
| **Animation** | [Framer Motion](https://motion.dev), Canvas API |
| **Font** | [Outfit](https://fonts.google.com/specimen/Outfit) |

## 📄 License

[MIT](LICENSE) © Kerem Can Kuru
