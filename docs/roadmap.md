# LifeLog — Roadmap

## V1 — shipped in this repository

- Offline-capable manual logging across 15 categories (food, drink, water,
  activity, running, strength, steps, sleep, nicotine, cannabis, alcohol,
  subjective ratings, symptoms, weight, notes)
- Today dashboard: nutrition card, quick metrics (only for logged data),
  chronological timeline, goals widget
- Quick Log: category picker + 15 dedicated forms, edit and delete
  (double-tap confirm) from the same sheet
- History: month calendar with a data-logged indicator, day detail view
- Trends: 7/30/90-day ranges, grouped metric picker, missing-day-aware
  averages and charts
- Profile (height/age/sex/activity level, current weight) and optional
  Goals with calm (non-red, non-guilt) progress bars
- Deterministic Daily Report (went well / could improve / tomorrow) — no
  LLM
- JSON backup export/import (merge or replace, Zod-validated, confirmed)
- Installable PWA, offline app shell, light/dark/system theme
- 37 unit/integration tests (Vitest) + Playwright e2e coverage of the
  required acceptance flow and no-horizontal-overflow checks at 4
  breakpoints

## V1.1 — faster logging

- Recent items in Quick Log (derived from the user's own last N entries
  per category, no hardcoded suggestions)
- Reusable food templates / favorites ("Coca-Cola 330 ml" saved once,
  reused with one tap)
- Swipe actions on timeline cards (in addition to, not instead of, the
  current tap-to-edit + confirm-to-delete flow)

## V1.2 — richer food data

- Barcode scanning (device camera → product lookup)
- Open Food Facts integration behind the same `FoodDetail` shape already
  in the domain model
- Recipe support (a saved recipe expands into one or more `food` entries
  with pre-filled nutrition)

## V1.3 — natural-language logging

- Real implementation of `NaturalLanguageLogParser`
  (`src/services/nlParser.ts`) behind a user-controlled backend/API proxy
  — never a frontend-embedded API key (see `docs/architecture.md` §11)
- Flow: free-text input → structured candidates → confidence-scored
  preview → user review/edit → committed as normal `LogEntry` rows
  (exactly the flow described in the product spec)

## V1.4 — voice logging

- Microphone → on-device or proxied speech-to-text → the same
  `NaturalLanguageLogParser` pipeline from V1.3 → preview → save

## V1.5 — smarter trends & associations

- Lightweight, on-device association analysis across already-collected
  categories ("days with longer reported sleep were associated with
  higher energy ratings") — descriptive only, always phrased as
  association, never causation, consistent with the Daily Report's
  existing tone
- Meal-timing observations (gaps without food, late meals, caffeine
  timing) using data that's already on every entry (`timestamp`) today

## V2 — optional sync

- Optional, explicitly opt-in encrypted account/sync for cross-device
  access — additive to local-first storage, not a replacement for it
- Built on the `id`/`updatedAt` conflict-resolution vocabulary already
  present on every `LogEntry` (see `docs/architecture.md` §12)
- No account required to keep using the app locally; sync is something a
  user turns on, not a gate to logging

---

Nothing beyond V1 is implemented in this repository. Items above are
scoped and sequenced, not started.
