<div align="center">

# 🧠 Decision App

**Osobní AI systém pro rozhodování, správu nápadů a denní focus**

[![Production](https://img.shields.io/badge/production-live-brightgreen?style=flat-square&logo=vercel)](https://decesion-up.vercel.app)
[![CI](https://github.com/soukoli/decesion-up/actions/workflows/ci.yml/badge.svg)](https://github.com/soukoli/decesion-up/actions/workflows/ci.yml)
[![Vercel Deploy](https://deploy-badge.vercel.app/vercel/decesion-up)](https://decesion-up.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?style=flat-square&logo=openai)](https://openai.com)
[![License](https://img.shields.io/badge/license-Private-lightgrey?style=flat-square)](.)

**[🚀 Live Demo](https://decesion-up.vercel.app)** · **[📊 Deployments](https://vercel.com/soukolis-projects/decesion-up/deployments)** · **[🐛 Issues](https://github.com/soukoli/decesion-up/issues)**

</div>

---

## 💡 O čem to je

Decision App je **Progressive Web App (PWA)** pro osobní rozhodování a organizaci myšlenek. Zaznamenáváš surové nápady, AI je automaticky kategorizuje do projektově-specifických skupin, a ty se rozhoduješ, co s nimi.

Není to další task manager. Je to **AI-first systém**, který se učí, jak přemýšlíš, a pomáhá ti udržet fokus na tom, co je opravdu důležité.

### ✨ Klíčové funkce

- 🎯 **Daily Focus** — jedna věta denně, na které skutečně záleží (sync napříč zařízeními)
- 🤖 **AI kategorizace** — GPT-4o-mini automaticky přiřazuje nápady do projektových skupin (ne generických tagů)
- 📝 **Zápisník myšlenek** — rychlý capture, žádné pole navíc
- 📚 **Knowledge Hub** — organizovaný přehled všech nápadů podle projektů
- 📰 **News Feed** — česká + světová IT sekce, infinite scroll, translate toggle, vertical swipe mezi články
- 🎙️ **Podcasty** — 12 kurátorovaných tech/business/vědeckých show (Lex Fridman, Huberman, Fuckupy v IT...)
- ☁️ **Google Drive backup** — automatická záloha do appdata (mimo uživatelův Drive)
- 🌗 **Dark/Light/System mód** — Shadcn/ui inspired design, no FOUC
- 📱 **PWA** — instaluje se jako nativní app, offline-first přes localStorage fallback
- 🔒 **Bezpečné** — Supabase RLS policies, Google OAuth, žádné secrets v kódu

---

## 🛠️ Tech Stack

| Vrstva | Technologie |
|--------|-------------|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| **Language** | [TypeScript 5.9](https://www.typescriptlang.org) (strict mode) |
| **Frontend** | [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com), [Framer Motion](https://motion.dev) |
| **UI Patterns** | CSS variables (light/dark), [Swiper.js](https://swiperjs.com) (touch gestures) |
| **Backend** | [Supabase](https://supabase.com) (Postgres + Auth + RLS) |
| **AI** | [OpenAI GPT-4o-mini](https://platform.openai.com) |
| **Auth** | Supabase Auth + Google OAuth (`drive.appdata` scope) |
| **Deploy** | [Vercel](https://vercel.com) (auto-deploy from `main`) |
| **CI/CD** | GitHub Actions (typecheck + tests + audit + build) |
| **Testing** | [Vitest 4](https://vitest.dev), [Testing Library](https://testing-library.com) — 28 testů |
| **Feed sources** | RSS parsing (`rss-parser`), HTML scraping (`cheerio`) |

---

## 🚀 Quick Start

### Prerequisites

- Node.js **≥ 20**
- npm **≥ 10**
- Supabase účet ([supabase.com](https://supabase.com) — free tier stačí)
- OpenAI API key ([platform.openai.com](https://platform.openai.com))

### Local development

```bash
# 1. Clone
git clone git@github.com:soukoli/decesion-up.git
cd decesion-up

# 2. Install
npm install

# 3. Configure env
cp .env.example .env.local
# → vyplň NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, OPENAI_API_KEY

# 4. Setup Supabase schema
# → v Supabase Dashboard → SQL Editor spusť migrace v supabase/migrations/*.sql
# (v pořadí podle timestamp v názvu souboru)

# 5. Run dev server
npm run dev
```

Otevři [http://localhost:3000](http://localhost:3000).

### Available scripts

```bash
npm run dev          # Next dev server (Turbopack)
npm run build        # Production build
npm start            # Production server
npm run lint         # ESLint
npm run typecheck    # TypeScript check (no emit)
npm test             # Vitest (single run)
npm run test:watch   # Vitest watch mode
npm run test:coverage # Coverage report
npm run precheck     # typecheck + tests (Husky pre-push hook)
```

---

## 🏗️ Architektura

```
┌─────────────────────────────────────────────────────────┐
│                      Browser (PWA)                       │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Home | Zápisník | Knowledge | Feed | Settings     │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕ HTTPS
┌─────────────────────────────────────────────────────────┐
│              Next.js 16 API Routes (Vercel)              │
│   /api/analyze  /api/translate  /api/podcasts  ...       │
└─────────────────────────────────────────────────────────┘
        ↕                    ↕                    ↕
   ┌─────────┐         ┌──────────┐        ┌──────────┐
   │Supabase │         │  OpenAI  │        │Google API│
   │ Postgres│         │GPT-4o    │        │Drive back│
   │ + Auth  │         │  mini    │        │up appdata│
   │ + RLS   │         └──────────┘        └──────────┘
   └─────────┘
```

### Data model (Supabase Postgres)

| Tabulka | Účel |
|---------|------|
| `user_profile` | User settings (theme, google tokens, daily_focus) |
| `idea_groups` | AI-generated projektové skupiny (max 15) |
| `ideas_raw` | Surové nápady před AI analýzou |
| `ideas_ai` | AI-obohacené nápady s přiřazením do skupiny |

Všechny tabulky mají **Row Level Security (RLS)** policies — každý user vidí jen svá data.

---

## 🔒 Security

- ✅ **RLS enabled** na všech tabulkách (WITH CHECK policies)
- ✅ **OAuth 2.0** přes Supabase (Google provider)
- ✅ **API keys** pouze v env variables, nikdy v kódu
- ✅ **CI secret scan** — GitHub Actions blokuje merge, pokud najde API key v kódu
- ✅ **Dependabot** — weekly security updates
- ✅ **npm audit** — 0 high/critical vulnerabilities

### Reporting security issues

Pokud najdeš zranitelnost, **prosím nezakládej public issue**. Napiš přímo maintainerovi.

---

## 🧪 CI/CD

```
Push to main
    ↓
GitHub Actions
    ├─ typecheck (tsc --noEmit)
    ├─ lint (ESLint)
    ├─ test (Vitest — 28 tests)
    ├─ build (Next.js build check)
    ├─ audit (npm audit --audit-level=high)
    └─ secret scan (grep for API keys)
    ↓
Vercel auto-deploy → Production
```

Pipeline running: [CI Workflow](https://github.com/soukoli/decesion-up/actions/workflows/ci.yml)

Live deployments: [Vercel Dashboard](https://vercel.com/soukolis-projects/decesion-up/deployments)

---

## 📁 Struktura projektu

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API routes (analyze, translate, podcasts)
│   ├── layout.tsx          # Root layout + theme script
│   └── page.tsx            # Main entry (auth-gated)
├── components/
│   ├── home/               # Home screen (Daily Focus, KPIs)
│   ├── notebook/           # Rychlý capture nápadů
│   ├── knowledge/          # AI-organized Knowledge Hub
│   ├── feed/               # News + AI/Tech + Podcasts
│   ├── settings/           # User settings, Google backup
│   └── shared/             # PageHeader, ErrorBoundary, ...
├── lib/
│   ├── supabase.ts         # Supabase client
│   ├── news.ts             # World RSS parser
│   ├── czech-news.ts       # Czech RSS parser (Lupa, Živě...)
│   ├── podcasts-config.ts  # Podcast catalog
│   └── theme.tsx           # ThemeProvider
└── test/                   # Vitest tests

supabase/
└── migrations/             # SQL migrations (run in Dashboard SQL Editor)

.github/
├── workflows/ci.yml        # GitHub Actions
└── dependabot.yml          # Auto dependency updates
```

---

## 🌍 Roadmap

- [ ] Widget na iOS Home Screen (přes Shortcuts)
- [ ] Voice input (Web Speech API)
- [ ] Export do Notion / Obsidian
- [ ] AI weekly summary — email s highlights
- [ ] Team mode (sdílené skupiny)

---

<div align="center">

**Postaveno s ❤️ v Praze**

[⬆ Zpět nahoru](#-decision-app)

</div>
