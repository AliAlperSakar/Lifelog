# LifeLog

A personal daily timeline for nutrition, activity, sleep, and lifestyle —
not a calorie counter. Log what happens throughout your day, gradually, in
seconds, and let the app work out the totals, trends, and a short daily
report. Local-first, offline-first, installable as a PWA, no account, no
backend, no server ever sees your data.

## Core features

- **Daily timeline** — a chronological feed of everything logged that day,
  editable and deletable, with daily totals that recalculate automatically.
- **Quick Log** — one sheet, 19 category shortcuts (food, drink, water,
  activity, running, strength, steps, sleep, caffeine, nicotine, cannabis,
  alcohol, mood, energy, appetite, focus, symptom, weight, note), each with
  a purpose-built form. Water has one-tap quick amounts (+250ml, +330ml, …).
- **Nutrition beyond calories** — protein, carbs, fat, fiber, sugar,
  optional micronutrient notes, with explicit measurement status
  (exact/approximate), source, and confidence per entry. Estimated values
  are always shown with `~` — never fabricated precision.
- **Missing ≠ zero** — an unlogged metric is simply absent from the UI, not
  displayed as 0. An explicitly logged zero (e.g. "0 cigarettes today") is
  shown as a real zero. This distinction is enforced in the aggregation
  layer, not just the UI (see `docs/architecture.md` §7).
- **History** — a month calendar with a data-logged indicator and full
  day-by-day timeline, all editable.
- **Trends** — 7/30/90-day ranges across nutrition, hydration, lifestyle,
  activity, and subjective ratings, with range averages that skip unlogged
  days rather than treating them as zero.
- **Daily Report** — a deterministic, rule-based summary (food / activity /
  lifestyle / what went well / could improve / tomorrow). No LLM, no
  network call, and never phrased as causation ("running caused…") — only
  what was logged and simple thresholds on it.
- **Goals** — optional numeric targets (protein, water, sleep, steps,
  running distance, weight, …) shown as calm progress bars, never red
  warnings or guilt-based messaging.
- **Backup & restore** — full JSON export, and import with a previewed
  summary, a merge-or-replace choice, and a confirmation step before
  anything is written.
- **PWA** — installable to a home screen, works fully offline after first
  load, light/dark/system theme, respects safe-area insets on notched
  phones.

## Screens

Today · Quick Log (sheet) · History · Trends · Profile · Goals ·
Settings & Backup · Daily Report

## Why local-first

Nutrition, activity, sleep, and substance-use data is some of the most
personal data a person can record. LifeLog stores it only in the browser's
IndexedDB, on the device it was entered on. There is no account, no
backend, and no server in V1 — the deployed app is static files (HTML/CSS/
JS) only. Nothing about what you eat, how you slept, or anything else you
log ever leaves your device unless you explicitly export a backup file
yourself.

## Privacy model

- **No account, no backend, no server-side database in V1.**
- **No analytics or tracking SDKs** — checked and intentionally absent.
- Personal data lives in IndexedDB (`lifelog-db`) in the browser.
- The only way data leaves the device is a JSON file you explicitly export
  (Settings → Export backup).
- Static hosting (Vercel/Netlify/Cloudflare Pages) serves application
  *code* only — never sees or stores your logged entries.

See `docs/architecture.md` for the full technical rationale, including the
uncertainty model, the timezone strategy, and the future-AI security
boundary (no API keys ever embedded in this frontend).

## Tech stack

React 19 · TypeScript (strict) · Vite · React Router · Dexie.js
(IndexedDB) · Zod · date-fns · Recharts · Tailwind CSS v4 ·
vite-plugin-pwa · Vitest + Testing Library · Playwright

`react-hook-form` was deliberately **not** used — the 15 Quick Log forms
are simple enough that plain controlled `useState` was less code and
easier to follow than wiring up a form library for each one; see
`docs/architecture.md` for other build-vs-skip decisions.

## Architecture

Layered/feature-oriented; screens never touch IndexedDB directly.
Full write-up: **`docs/architecture.md`**.

```
src/
  app/            Router shell, layout, theme, quick-log modal state
  components/     Presentational UI primitives
  domain/         Types, Zod schemas, pure domain helpers
  db/             Dexie database module, schema, seed data, bootstrap
  repositories/   The only layer that imports db/database.ts
  services/       Pure aggregation / trends / daily report / backup logic
  hooks/          React bindings over repositories (live queries)
  features/       Screens, grouped by product area
  utils/          Date/number formatting helpers
```

## IndexedDB database

Database name `lifelog-db`, four tables: `entries`, `profile`, `goals`,
`settings`. Schema and indexes are defined once, in `src/db/database.ts`,
with explicit Dexie version numbers for future migrations. Details in
`docs/architecture.md` §3.

## Development setup

Requires Node 20+.

```bash
npm install
```

## Running locally

```bash
npm run dev
```

Starts the Vite dev server (default `http://localhost:5173`).

## Production build

```bash
npm run build
```

Runs `tsc -b` (typecheck) then `vite build`. Output goes to `dist/`.

```bash
npm run preview
```

Serves the production build locally for a final check before deploying.

## Tests

```bash
npm test            # Vitest — unit/integration tests (run once)
npm run test:watch  # Vitest — watch mode
npm run test:e2e    # Playwright — end-to-end acceptance + responsive checks
```

`npm run test:e2e` builds nothing itself — run `npm run build` first, or
point `playwright.config.ts`'s `webServer` at your own running server. It
launches the preview server on port 4173 automatically.

## Lint & typecheck

```bash
npm run lint        # oxlint
npm run typecheck   # tsc -b --noEmit
```

## PWA installation

- **iPhone (Safari):** open the deployed URL, tap **Share**, then
  **Add to Home Screen**.
- **Android / desktop Chrome or Edge:** look for an **Install** icon in
  the address bar, or the browser's install prompt.

The app works fully in a normal browser tab too — installation is optional
and only improves the experience (full-screen, app-icon, faster launch).

## Data export / import

Settings → **Export backup (JSON)** downloads
`lifelog-backup-YYYY-MM-DD.json` containing your profile, goals, settings,
and every logged entry, with schema/version metadata.

Settings → **Import backup** reads a file, validates it (rejecting
malformed or foreign JSON with a clear message), shows a preview (entry
count, date range, export date), and requires a second confirming tap
before writing anything. Choose **Merge** (adds/updates by id, keeps
everything else already on the device) or **Replace all** (wipes local
data first, then restores exactly what's in the file).

## Deployment

Static hosting only — no server component. Recommended, in order of
simplicity for this project: **Vercel**, **Cloudflare Pages**, **Netlify**.
A `vercel.json` (SPA rewrite) and `public/_redirects` (Netlify) are
included so client-side routing works correctly on either. GitHub Pages
works too but needs its own SPA-fallback and base-path configuration,
which isn't set up here by default.

Whichever host you pick, it is serving static application files only —
your logged data never reaches it; that's the whole point of local-first
storage.

## Future AI architecture

`src/services/nlParser.ts` defines `NaturalLanguageLogParser`, the
interface a future natural-language/voice logging feature will implement
("I ate two croissants and a small Earl Grey" → structured candidate
entries → user review → save). V1 ships only
`LocalMockNaturalLanguageLogParser`, which makes no network call and
returns no candidates — it exists purely so the UI layer can eventually be
built against a stable contract. A real implementation must go through a
backend/API proxy the user controls; no AI provider API key is ever meant
to live in this frontend bundle. Full rationale in `docs/architecture.md`.

## Roadmap

See `docs/roadmap.md` for what's planned beyond V1 (recent/favorite items,
barcode scanning, natural-language logging, voice logging, association
insights, optional encrypted sync) — none of it is implemented here.

## License

Proprietary — all rights reserved. See `LICENSE`. This is not open-source
software.
