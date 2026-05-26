# Decision App New — Architecture & Memory

> AI Agent reference file. Keep updated after structural changes.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion |
| Navigation | Swiper (horizontal swipe) |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (Google OAuth) |
| AI | OpenAI GPT-4o-mini (via API route) |
| Deploy | Vercel |
| PWA | manifest.json, standalone |

## Database Schema (4 tables)

```
user_profile
├── id: uuid (PK, FK → auth.users)
├── font_size: text ('sm'|'md'|'lg') DEFAULT 'md'
├── language: text ('cs'|'en') DEFAULT 'cs'
├── theme: text ('dark'|'light'|'system') DEFAULT 'dark'
├── created_at: timestamptz
└── updated_at: timestamptz (auto-trigger)

idea_groups
├── id: uuid (PK, gen_random_uuid)
├── user_id: uuid (FK → auth.users)
├── name: text NOT NULL
├── color: text ('red'|'yellow'|'blue'|'purple') DEFAULT 'blue'
├── ai_generated: boolean DEFAULT true
├── created_at: timestamptz
└── updated_at: timestamptz (auto-trigger)

ideas_raw
├── id: uuid (PK, gen_random_uuid)
├── user_id: uuid (FK → auth.users)
├── content: text NOT NULL
├── source: text ('text'|'voice'|'podcast'|'school') DEFAULT 'text'
├── podcast_name: text (nullable)
└── created_at: timestamptz

ideas_ai
├── id: uuid (PK, gen_random_uuid)
├── raw_id: uuid (FK → ideas_raw, CASCADE)
├── user_id: uuid (FK → auth.users)
├── title: text NOT NULL
├── context: text (nullable — original user input)
├── priority: text ('red'|'yellow'|'blue'|'purple') DEFAULT 'blue'
├── status: text ('active'|'done'|'archived') DEFAULT 'active'
├── group_id: uuid (FK → idea_groups, SET NULL)
├── ai_label: text (nullable — group name for display)
├── ai_reason: text (nullable — why AI chose this)
├── done_at: timestamptz (nullable)
├── created_at: timestamptz
└── updated_at: timestamptz (auto-trigger)
```

**RLS:** All tables have `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`
**Indexes:** user_id, status, priority, group_id on ideas_ai
**Triggers:** updated_at auto-set on UPDATE for user_profile, ideas_ai, idea_groups

## API Routes

| Route | Method | DB Tables | External |
|-------|--------|-----------|----------|
| `/api/ideas` | POST | ideas_raw (INSERT) | - |
| `/api/ideas` | GET | ideas_ai + idea_groups (SELECT) | - |
| `/api/ideas` | PATCH | ideas_ai (UPDATE) | - |
| `/api/ideas` | DELETE | ideas_ai + ideas_raw (DELETE) | - |
| `/api/analyze` | POST | ideas_ai (INSERT), idea_groups (SELECT/INSERT) | OpenAI GPT-4o-mini |
| `/api/groups` | GET | idea_groups (SELECT) | - |
| `/api/backup` | GET/POST/PUT | ideas_raw, ideas_ai, idea_groups (ALL) | Google Drive API |
| `/api/podcasts` | GET | - | RSS feeds |
| `/api/trends` | GET | - | HackerNews API |
| `/api/research` | GET | - | arXiv API |
| `/api/news` | GET | - | BBC/Guardian/NPR RSS |
| `/api/news/czech` | GET | - | Czech news RSS |
| `/api/school` | GET | - | horackova.cz scraper |

## Screens & Components

```
page.tsx (root — responsive detection)
├── Mobile: Swiper 3-world + floating pill nav + [+] IdeaSheet
│   ├── HomeScreen (summary cards, priority groups, profile access)
│   ├── FeedScreen (4 tabs: Podcasts/AI&Tech/News/School)
│   └── KnowledgeScreen (ideas CRUD, filters, search, inline expand)
└── Desktop: DesktopLayout (sidebar + content)

Overlays:
├── IdeaSheet (bottom drawer from [+] nav button)
├── ProfileScreen (from Home avatar, fullscreen)
└── Snackbar (global, bottom-24, UNDO support)
```

## Data Flow

```
User captures idea:
  IdeaSheet → POST /api/ideas → ideas_raw saved
            → dispatch('idea-created', tempIdea) → Knowledge shows immediately
            → POST /api/analyze (background)
                → OpenAI (full context: all ideas + groups + history)
                → ideas_ai INSERT (with title, priority, group)
                → dispatch('idea-updated') → Knowledge refetches real data
                → Snackbar: "✓ Group Name 🔴"

User manages ideas:
  KnowledgeScreen → inline expand → Done/Edit/Copy/Archive/Delete
  Delete → optimistic remove → 5s timeout → actual DELETE (UNDO via Snackbar)

Feed data:
  FeedScreen → fetchAll() → parallel fetch 5 APIs → render cards
  Refresh button → stale-while-revalidate (data stays visible during reload)
```

## Key Conventions

- **TypeScript interfaces MUST match DB schema exactly** (see types/index.ts comments)
- **API routes use `createServerSupabase()`** — cookie-based auth via middleware
- **RLS policies require BOTH `using` AND `with check`** for INSERT to work
- **No spread operators in DB operations** — explicitly list columns to prevent schema drift
- **`_processing` flag is client-only** — never sent to/from API
- **Custom DOM events** for cross-component communication (`idea-created`, `idea-updated`)
- **Visibility-based refresh pattern** — no setInterval, refresh on app focus
- **Stale-while-revalidate** — show old data while fetching new

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL      — Supabase project URL (public, safe)
NEXT_PUBLIC_SUPABASE_ANON_KEY — Supabase anon key (public, RLS protects data)
OPENAI_API_KEY                — Server-only (NEVER prefix with NEXT_PUBLIC_)
```

## Supabase Auth Notes

- Google OAuth with `drive.appdata` scope (for backup)
- Provider token stored in session (accessible via `session.provider_token`)
- Middleware redirects unauthenticated to `/login` (excludes static files, .json, .ico)
- Auth callback at `/auth/callback` exchanges code for session + sets cookies
