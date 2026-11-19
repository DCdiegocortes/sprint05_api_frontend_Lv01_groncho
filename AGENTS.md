# Grôncho client · agent guide

React client for the Grôncho API (Sprint 05, Laravel 13 + Passport). A money-free clothing exchange: people build a universe, swipe other universes, match, then trade or gift pieces.

This project is built with AI assistance end to end. Every agent working here follows this file.

## Sources of truth

| What | Where |
|---|---|
| Product, flows, design and plan | `docs/01-prd.pdf` to `docs/06-implementation-plan.pdf` (HTML sources in `docs/_source/`) |
| Screens | Figma file `QQNStcDxxsgcT8k0zvpL5q`, page `03 — Wireframes`, frames `03.x` |
| API | `../sprint05_api_Lv01_groncho` (Laravel). Routes in `routes/api.php`, rules in `app/Http/Requests` |

If a screen needs data the API does not return, stop and say so. Never fake API data in the client.

## Stack

React 19 · JavaScript (no TypeScript) · Vite · Tailwind CSS 4 (`@theme` in `src/index.css`) · Vitest + Testing Library · oxlint.
Added in later branches: shadcn/ui on Radix, Motion, TanStack Query, Axios, React Router, React Hook Form + Zod, Lucide.

## Commands

```bash
npm install
npm run dev        # http://localhost:5173
npm run test       # vitest run
npm run lint       # oxlint
npm run build
```

Copy `.env.example` to `.env.local`. `VITE_API_URL` points to the API (`http://localhost:8000/api`).

## Architecture

```
src/
  app/          router, providers, layouts
  api/          client.js and one file per resource (auth, profile, universes, items, swipes, matches, exchanges, notifications, users)
  features/     discover, universe, closet, matches, requests, admin
  components/   shared UI: Button, Input, Chip, Switch, TabBar, Toast, Sheet, SlideToConfirm
  hooks/        useAuth, useToast, useReducedMotion
  lib/          schemas.js, format.js, constants
  styles/
```

- Components never call Axios. A screen uses a hook, the hook uses `src/api`.
- Server state lives in TanStack Query. Query keys: `['profile']`, `['feed', search]`, `['universe','mine']`, `['items']`, `['matches']`, `['wardrobe', id]`, `['exchanges']`, `['notifications']`, `['unread']`, `['users']`.
- Every API enum is mirrored as a JS constant in `src/lib/constants.js`. Never compare raw strings in components.
- Auth: `POST /login` returns a Passport token, kept in memory and localStorage. Axios adds `Authorization: Bearer` and `Accept: application/json`. A 401 clears the session and goes to Log in.

## API facts the UI depends on

- Register returns the user without a token: log in right after.
- `GET /universes/mine` is 404 until the user creates a universe (name required, style and description optional).
- Feed: `GET /universes/feed?search=` returns 10 universes with owner and images, hiding your own and everyone you swiped.
- `POST /swipes` returns `matched` and `match_id`. One swipe per person, no undo.
- Images: field `images[]`, image files up to 10 MB each, every image comes with `url`, every user with `avatar_url` and `handle`.
- Exchanges: PENDING → ACCEPTED or REJECTED, ACCEPTED → FINISHED. Only the owner of the requested piece answers. The requester cancels unless FINISHED. TRADE needs an offered piece, GIFT none, both must fit the piece `offer_type`. 403 when received minus given is above 2.
- Pieces that were ever in an exchange answer 409 on delete.
- Styles are one comma separated string, max 255, saved in uppercase.
- Decorations: max 50. STICKER names match `^[A-Z0-9_]+$` (the sticker files live in `public/stickers/`), EMOJI is a single emoji, TEXT max 100 chars with fonts ITALIANA, INSTRUMENT, FRAUNCES, DM_MONO, BODONI and colours BLACK, PINK, WHITE.
- No video, no password reset, no real time (the bell polls).

## Design rules

- Tokens live in `src/index.css` (`@theme`) and are used as Tailwind classes, never raw hex in components:
  - colours `paper` `card` `plate` `engrave` `ink` `secondary` `muted` `accent` `hairline`
  - depth `shadow-raised` `shadow-subtle` `shadow-float` `shadow-accent` `shadow-inset` `shadow-pressed`
  - radius `rounded-sm` 6 · `md` 14 · `lg` 20 · `xl` 28 · `2xl` 36
  - type `text-headline` `text-display` `text-subline` `text-item`, utility `label-mono`
  - motion `ease-ui`, utility `press` (scale .97 on press)
- Primitives in `src/components/ui` (shadcn style with `cn` and `cva`): `Button`, `Input`, `Chip`. New shadcn components go there through `components.json` and get restyled to these tokens. Import with the `@/` alias.
- Fonts: Inter (UI), DM Mono (labels, uppercase, wide tracking), Instrument Serif (sublines).
- Neumorphic paper: raised for actions and things at rest, inset for selected or active states. Selected chips are inset with ink semi bold text, never pink fills.
- One pink only, used rarely: primary button, active tab, progress, unread dot.
- Black only for type and hairlines. No gradient fades, no blur placeholders, no spinners.
- Buttons show only their label, never an arrow glyph.
- Never underline text to highlight it or on hover. Use colour, opacity or the neumorphic press instead. The only line is the pink one under the logo.
- Screen headlines: two lines, Inter Bold 36, tight tracking, with a mono label above (`003 — Your universe`).
- Copy in English, short and human, no long dashes in prose.
- Motion: animate transform and opacity only, 150 to 300 ms, springs for gestures, respect `prefers-reduced-motion`.

## Code rules

- No explanatory comments in code.
- Small components, one job each. Names in English.
- Every feature ships with a test of its key behaviour.
- Keep the UI matching its Figma frame on mobile first, then desktop.

## Git

- Gitflow: `main`, `develop`, `feature/*` from `develop`, merged by pull request. Never delete a branch after merging.
- Commit messages: one line in English with a conventional prefix (`feat:`, `fix:`, `style:`, `test:`, `docs:`, `chore:`).
- Stage files by name, never `git add .`.
- Pull request body uses `## What it includes` and `## How to test`.
