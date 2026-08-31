# LifeLog — Implementation Report

## 1. App name

**LifeLog** — a local-first, offline-first daily timeline for nutrition,
activity, sleep, and lifestyle.

## 2. Repository

https://github.com/AliAlperSakar/Lifelog (private, MIT-licensed)

7 commits, incremental by phase:

1. `chore: scaffold Vite + React + TypeScript project`
2. `feat: local database, domain model, and aggregation services`
3. `feat: complete UI — Today, Quick Log, History, Trends, Profile, Settings, Daily Report`
4. `test: add Playwright e2e coverage for the required acceptance flows`
5. `fix: visual polish pass from a full screenshot review`
6. `docs: README, architecture, roadmap, license, deployment config`
7. `chore: switch license from proprietary to MIT`

## 3. Deployment

Not deployed to a live URL — out of scope for this pass. The app is
deploy-ready as static output (`npm run build` → `dist/`) to Vercel,
Cloudflare Pages, or Netlify; `vercel.json` and `public/_redirects` are
already in the repo for SPA routing on either. Say the word and I can wire
one up next.

## 4. What it does

A chronological, editable timeline for a day's food, drink, water, caffeine,
activity, running, strength/knee training, steps, sleep, nicotine, cannabis,
alcohol, mood/energy/appetite/focus ratings, symptoms, weight, and free-text
notes — 19 Quick Log shortcuts across 15 underlying categories. Today's
screen totals recalculate live from whatever's actually been logged. History
gives a month calendar with a data-logged indicator and full day detail.
Trends charts 7/30/90-day ranges across every category, with range averages
that skip unlogged days instead of counting them as zero. Daily Report is a
deterministic (non-LLM) rule-based summary — went well / could improve /
tomorrow — written to never imply causation. Goals are optional numeric
targets shown as calm, non-red progress bars. Settings has full JSON backup
export and a validated, previewed, confirmed import (merge or replace).
Installable as a PWA; works fully offline after first load.

## 5. Key architecture decisions

- **Layered/feature-oriented**, not a flat components folder: `domain` →
  `db`/`repositories` → `services` → `hooks` → `features` (screens). Screens
  never touch IndexedDB directly; `repositories/` is the only layer that
  imports `db/database.ts`.
- **Flexible event-based `LogEntry`** discriminated union rather than 15
  separate tables — one timeline, one query surface, easy to extend with new
  categories later without a schema rewrite.
- **`DistributiveOmit<T, K>`** utility type to fix a real TypeScript
  footgun: `Omit` over a union collapses to the *intersection* of member
  keys, which was silently dropping category-specific fields from payload
  types. Documented in `docs/architecture.md` §9 since it's non-obvious and
  worth remembering.
- **Missing ≠ zero enforced structurally**, not just visually: aggregation
  functions return `Aggregate | undefined` and `sumContributions()` returns
  `undefined` when nothing was logged, so an unlogged metric can't
  accidentally render as `0` anywhere downstream.
- **`react-hook-form` deliberately dropped**: the 15 Quick Log forms are
  simple enough that plain `useState` was less code and easier to follow.
  Noted as a build-vs-skip call rather than silently doing something
  different from the spec.
- **Timezone safety by string-slicing ISO timestamps** rather than
  `parseISO()` + `format()` round-trips through `Date`, which re-renders in
  the *runtime's* current timezone rather than the timestamp's embedded
  offset — would have silently misfiled entries logged near midnight for
  anyone not in UTC.

## 6. Database design

Dexie/IndexedDB, database name `lifelog-db`, four tables: `entries`,
`profile`, `goals`, `settings`, versioned from `db.version(1)` for future
migrations. Full schema, indexes, and rationale in `docs/architecture.md`
§3.

## 7. Privacy model

No account, no backend, no server-side storage, no analytics/tracking SDKs.
All data lives in the browser's IndexedDB on the device it was entered on.
The only way data leaves the device is an explicit JSON export the user
triggers themselves (Settings → Export backup). A deployed build is static
files only — hosting never sees logged entries.

## 8. Run / build / test

```bash
npm install
npm run dev          # dev server
npm run build         # tsc -b && vite build → dist/
npm run preview       # serve the production build locally
npm test               # Vitest, unit/integration
npm run test:e2e      # Playwright, needs a build first
npm run lint            # oxlint
npm run typecheck    # tsc -b --noEmit
```

## 9. Test / build results (re-verified just before this report)

- `typecheck` — clean, no errors
- `lint` — clean; 5 pre-existing informational warnings only (React
  fast-refresh export-shape notices, one effect-derived-state note), no
  errors
- `test` — **37/37 unit/integration tests passing** (Vitest)
- `test:e2e` — **14/14 Playwright tests passing** across mobile (390×844)
  and desktop (1440×900) projects, covering the full required acceptance
  flow (seed data → add Banana → reload persistence → edit → delete → totals
  return to baseline) plus no-horizontal-overflow checks at all four
  required breakpoints
- `build` — succeeds, generates the PWA service worker and manifest

## 10. PWA install

- **iPhone/Safari:** open the URL → Share → Add to Home Screen
- **Android/desktop Chrome/Edge:** install icon in the address bar, or the
  browser's own install prompt

Works as a normal browser tab too — installing is optional.

## 11. Backup / import

Settings → Export backup downloads `lifelog-backup-YYYY-MM-DD.json` with
schema/version metadata, profile, goals, settings, and every entry. Import
reads a file, rejects malformed/foreign JSON with a clear message, shows a
preview (entry count, date range, export date), then requires a second
confirming tap before writing — choice of **Merge** (upsert by id) or
**Replace all** (wipe local data, restore exactly what's in the file).

## 12. Current limitations

- No live deployment yet (static-hosting-ready, not hosted)
- No barcode/food-database lookup — nutrition entry is manual/estimated
  only, by design for V1
- No natural-language or voice logging — `nlParser.ts` defines the future
  interface but ships only a no-op local mock; a real implementation needs a
  user-controlled backend proxy (never a frontend-embedded AI key)
- No recent-items/favorites shortcut yet — every entry is typed fresh
- Single-device only — no sync (by design; see Roadmap V2)

## 13. Deferred features (see `docs/roadmap.md` for full detail)

Recent items/favorites and reusable food templates (V1.1); barcode
scanning and Open Food Facts integration (V1.2); real natural-language
logging (V1.3); voice logging (V1.4); on-device association analysis and
meal-timing observations, still correlation-only language (V1.5); optional
opt-in encrypted sync (V2).

## 14. Recommended next milestone

Either (a) a live deployment (Vercel/Cloudflare Pages/Netlify — repo is
already configured for both) so the PWA is installable from a real URL
instead of only `localhost`, or (b) V1.1's recent-items/favorites, which is
the single highest-leverage change for the stated goal of logging "in
seconds."

## 15. Decisions made without stopping to ask (per your standing instruction to use sensible defaults)

- Chose Dexie over raw `idb` for the IndexedDB layer (better TS ergonomics,
  live queries via `dexie-react-hooks`)
- Chose oxlint over ESLint (faster, sufficient ruleset for this project's
  size)
- Dropped `react-hook-form` (see §5)
- Seeded the demo day and profile with the exact example values given in
  the spec (~4,055 kcal, ~133g protein, ~228g sugar; height 190cm, weight
  ~95kg)

## 16. Decisions changed mid-session at your explicit request

- **License: proprietary → MIT.** The repo originally shipped as
  all-rights-reserved per the spec's default ("proprietary unless
  open-source intent is stated"). You explicitly asked for MIT, so
  `LICENSE`, `README.md`, and `package.json`'s `license` field were all
  updated (commit 7). Worth a second look: MIT permits reuse/redistribution
  by anyone, which is a real change from the original "confidential, no
  license granted" stance — confirm that's still what you want now that
  it's live.
- **Repo visibility:** created as **private**. Public was mentioned as an
  option (it fits an MIT project) but I didn't see you confirm it either
  way — worth deciding explicitly, especially since the repo currently
  contains only source code and demo/seed data, not any real personal
  health data (the app is local-only; nothing you log ever gets committed).

## 17. How delivery actually happened (worth knowing for next time)

This cloud sandbox blocks authenticated GitHub API/push traffic outright —
it intercepts any token with a "builtin injection" layer that only works for
repos pre-authorized as a session source, which none were. So the actual
path was: build and commit everything locally in the sandbox → package it as
a git bundle (preserves full commit history, unlike a zip) → place that
bundle on your Windows machine via the device-file bridge once your computer
got linked → you created the empty GitHub repo yourself (browser sign-in
isn't something I'm able to do — credential entry is off-limits) → you ran
`git clone`/`remote set-url`/`git push` from a local terminal, which isn't
subject to the sandbox's GitHub restriction. Good to know if this comes up
again: local terminal push is the reliable path, not an in-sandbox API call.
