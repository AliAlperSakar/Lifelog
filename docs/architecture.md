# LifeLog — Architecture

This document explains how the app is put together and why, so future work
(by you, by Claude, by anyone) can extend it without re-deriving these
decisions from scratch.

## 1. Layers

```
src/
  app/            Router shell, layout, theme, quick-log modal state
  components/     Presentational-only UI primitives (Card, Button, Sheet, Field…)
  domain/         Types, zod validation, pure domain helpers (no I/O)
  db/             The one Dexie database module + seed data + bootstrap
  repositories/   The only code allowed to touch db/database.ts directly
  services/       Pure aggregation/report/backup/trend logic (all unit-testable)
  hooks/          Thin React bindings over repositories (useLiveQuery)
  features/       Screens, grouped by product area (today, log, history, trends…)
  utils/          Formatting/date helpers with no domain knowledge
```

The rule that keeps this maintainable: **screens never query IndexedDB
directly, and never import Dexie**. A screen calls a hook (`useEntriesForDate`,
`useDailySummary`, …); a hook calls a repository; a repository is the only
thing that imports `db/database.ts`. Aggregation (turning entries into
totals) is a pure function of an array of entries — it doesn't know Dexie
exists, which is what makes `src/services/*.test.ts` fast, deterministic
unit tests instead of integration tests against a fake database.

## 2. Domain model

Everything the user records is a `LogEntry` (`src/domain/types.ts`) — a
single flexible, timestamped event, discriminated by `category`
(`food`, `drink`, `water`, `activity`, `running`, `strength`, `steps`,
`sleep`, `nicotine`, `cannabis`, `alcohol`, `subjective`, `symptom`,
`weight`, `note`). Category-specific data lives in a typed `detail` object
rather than one flat bag of ~60 optional fields, so each category stays
strongly typed while the storage/aggregation layers still treat all
entries uniformly as "events on a timeline" — this is the literal
implementation of the spec's "flexible Log Entries/Events" mental model.

Notable simplifications, made deliberately rather than by omission:

- **Body weight has no separate `BodyMeasurement` table.** It's a
  `LogEntry` with `category: 'weight'`. The spec allows this
  ("you may simplify… avoid unnecessary entity fragmentation"), and having
  one entry table means History/backup/export don't need special-casing.
- **Caffeine is not its own category.** "Caffeine" in the Quick Log picker
  is a shortcut that opens the `drink` form pre-set to `coffee`. A
  Coca-Cola/coffee/tea entry carries its own optional `caffeineMg` field.
  This is what the spec's "avoid double-counting caffeine" requirement
  actually implies: if caffeine were a second event, logging a Coke would
  require two entries that could drift out of sync. `calculateDailyCaffeine`
  sums `caffeineMg` across drink entries directly.
- **Mood / Energy / Appetite / Concentration are one category
  (`subjective`) with a `subtype`.** The Quick Log picker still shows four
  separate one-tap buttons (fast logging matters more than data-model
  purity at the UI layer) but they all write the same shape: a 1-5 rating.
  Appetite's rating is mapped to labels (Very low… Very high) for display.
- **`DistributiveOmit<T, K>`** (`domain/types.ts`) exists because
  `Omit<Union, K>` is a classic TypeScript trap: `keyof` over a union
  resolves to the *intersection* of member keys, so a plain `Omit` on the
  15-branch `LogEntry` union silently collapses every branch's unique
  fields (`subtype`, `source`, `measurementStatus`…) down to only the
  fields every single category shares. `DistributiveOmit` distributes the
  `Omit` over each union member first. This is what makes
  `logEntryRepository.create()`/`.update()` accept a fully-typed,
  category-correct payload instead of a lossy, over-widened one.

## 3. Database (Dexie / IndexedDB)

One file owns the schema: `src/db/database.ts`.

```ts
this.version(1).stores({
  entries: 'id, localDate, category, [localDate+category], timestamp, createdAt, updatedAt',
  profile: 'id',
  goals: 'id, type, active',
  settings: 'id',
})
```

Indexes are chosen for the queries the app actually runs: "entries for a
given day" (`localDate`), "entries of one category" (`category`),
`[localDate+category]` for the (currently unused but cheap-to-keep) case of
filtering both at once, and `timestamp`/`createdAt` for stable chronological
ordering. `profile` and `settings` are singleton tables (`id: 'profile'`,
`id: 'app'`) — simpler than a one-row table with implicit conventions.

**Migrations.** Future schema changes bump `.version(n+1).stores({...})`
and add `.upgrade(tx => …)` when a transformation (not just an added index)
is needed. Dexie migrations run in place against the user's existing data —
never drop a store to "start over"; that's what `deleteAllDemoData` /
"Delete all local data" are for, and both are explicit, user-initiated,
double-confirmed actions (see §8).

## 4. Repositories

`src/repositories/*.ts` — `logEntryRepository`, `profileRepository`,
`goalRepository`, `settingsRepository`. Each is a small object of async
functions (`create`, `update`, `remove`, `getForDate`, `getBetweenDates`, …).
No class hierarchy, no dependency injection framework — these are simple
enough that more structure would be overhead, not safety.

`logEntryRepository.update()` intentionally takes the *same shape* as
`.create()` (a full category payload minus generated fields), not a sparse
`Partial<LogEntry>` patch. That matches how the app actually edits things:
every Quick Log form pre-fills from the existing entry and resubmits the
whole category payload on save, so there's never a legitimate "patch just
one field of a food entry" call to support, and modeling `update` that way
sidesteps the `Partial<Union>` version of the same TypeScript trap
`DistributiveOmit` solves for `create`.

## 5. Aggregation services (`src/services/aggregation.ts`)

Pure functions: `calculateDailyNutrition`, `calculateDailyWater`,
`calculateDailyFluids`, `calculateDailyCaffeine`, `calculateDailySteps`,
`calculateDailyActivity`, `calculateDailyRunning`, `calculateDailySleep`,
`calculateSubjectiveSummary`, `calculateDailyNicotine`,
`calculateDailyAlcoholUnits`, `calculateDailyCannabisCount`,
`latestWeightEntry`, and the umbrella `calculateDailySummary`. Every one
takes `LogEntry[]` and returns numbers — no Dexie, no React, no dates
beyond what's already on the entries. `calculateDailySummary` is what
both the Today screen and the Daily Report are built from, so "what today
looks like" is defined in exactly one place.

`src/services/trends.ts` builds on top of it: `calculateTrendSeries` maps a
list of dates against entries-grouped-by-date into per-day points, and
`calculateDateRangeAverage` averages only the days that were actually
logged.

## 6. The uncertainty model

Three fields carry provenance on any entry whose values can be estimated
(`food`, `drink`, `weight`): `source` (`manual | label | database | ai |
calculated | device | demo`), `measurementStatus` (`exact | approximate`),
`confidence` (`low | medium | high`). Numbers are still stored as plain
`number`s — aggregation stays simple arithmetic — but every aggregate
returned by the services above is an `Aggregate` (`domain/aggregate.ts`):

```ts
interface Aggregate { value: number; approximate: boolean; entryCount: number }
```

`approximate` is true if *any* contributing entry was approximate, and
every place a number reaches the UI goes through `formatApprox()`
(`utils/format.ts`), which prefixes `~` only when `measurementStatus ===
'approximate'`. This is why "~430 kcal" never silently becomes "431 kcal" —
precision is never fabricated by rounding/formatting code; it's carried
from the point of entry.

## 7. Missing data vs. real zero

`sumContributions()` (`domain/aggregate.ts`) is the one place this rule is
enforced: it filters to entries with a *defined* value, and returns
`undefined` — not `{ value: 0 }` — when nothing contributed. Concretely:

- No water entries today → `calculateDailyWater` returns `undefined` →
  the Today screen simply omits the Water tile (`QuickMetricsGrid` only
  renders tiles for metrics that exist).
- A nicotine entry logged with `count: 0` → returns `{ value: 0, … }` —
  a real, meaningful zero, shown as "0×", not hidden.
- A drink entry with no `caffeineMg` given → does not contribute to
  `calculateDailyCaffeine` at all (as if the entry didn't exist for that
  metric), so an unknown-caffeine coffee never drags the day's total down
  by counting as 0mg.
- Trends: `calculateDateRangeAverage` divides by the number of *logged*
  days, not the number of days in the range — a week with 2 logged days
  and 5 empty ones averages over 2, never treats the 5 empty days as 0.

## 8. Backup / import (`src/services/backup.ts`)

`buildBackup()` assembles a `BackupEnvelope` (`schema: 'lifelog-backup'`,
a `schemaVersion` int, `exportedAt`, `appVersion`, plus `profile`,
`settings`, `goals`, `entries`). `exportBackupToFile()` downloads it as
`lifelog-backup-YYYY-MM-DD.json` via a Blob URL — no network call.

`parseBackupJson()` runs the file through `backupEnvelopeSchema` (Zod,
`domain/validation.ts`) before anything touches the database, and throws a
typed `BackupValidationError` with a human-readable message on malformed
JSON, a schema mismatch, or (for example) a `localDate` that isn't
`YYYY-MM-DD`. The Settings screen shows a preview (entry count, date range,
export timestamp) and requires a second confirming tap before
`importBackup()` runs. Two strategies: `merge` (bulk-put by id — an
existing entry with the same id is overwritten, everything else on the
device is untouched) or `replace` (clears entries/goals first, then
restores exactly what's in the file). Nothing is ever imported silently.

## 9. PWA strategy

`vite-plugin-pwa` in `generateSW` mode (`vite.config.ts`): precaches the
built app shell (JS/CSS/HTML/icons) so Today/History/Trends/Profile/
Settings/Quick Log/Daily Report all work with no network at all once the
app has been opened once. `registerType: 'prompt'` plus a manual
`useRegisterSW()` banner (`app/UpdateBanner.tsx`) means a new deployed
version never force-reloads someone mid-log-entry — it shows a dismissible
"Update available → Reload" bar and waits for the user.

There are deliberately **no runtime caching rules** beyond the precached
shell: the app makes no runtime network requests for its own data (it's
local-first), so there's nothing else to cache.

## 10. Timezone strategy

Every entry stores both an absolute `timestamp` (ISO 8601 *with the
device's UTC offset embedded*, e.g. `2026-08-31T00:30:00+02:00`) and a
`localDate` (`YYYY-MM-DD`) computed once, at entry time, from that same
timestamp. The critical detail is in `utils/date.ts`:
`localDateFromTimestamp()` and `formatTime()` read the date/time
characters directly out of the ISO string with a regex, rather than doing
`parseISO(ts)` → `format(date, …)`. The reason: `date-fns`'s `Date` object
is an absolute instant, and `format()` always renders it in *the current
JS runtime's* timezone — not the offset that was embedded in the string.
Round-tripping through `Date` would silently shift a `00:30+09:00` entry
to the previous UTC day if it were ever displayed or re-grouped by a
process running in a different timezone (a different machine restoring a
backup, a CI runner, …). String-slicing sidesteps that entirely: the
characters in the timestamp are the local wall-clock time as recorded,
period. This is covered directly by
`utils/date.test.ts` ("does not shift the date when the recorded offset
differs from the runtime timezone").

`minutesBetween()` (used for sleep duration) is the one place we *do* want
real `Date` arithmetic, because computing a duration between two absolute
instants is correctly timezone-agnostic — that's fine to route through
`parseISO`/`differenceInMinutes`.

## 11. Privacy boundaries

- All data lives in IndexedDB, in the browser, on the device. No backend
  exists in V1. Nothing is sent anywhere over the network for the app's
  own data.
- No analytics/tracking SDKs are included (checked as part of the
  dependency list — see `package.json`).
- The `EntrySource` type includes `'ai'` and the `NaturalLanguageLogParser`
  interface exists (`services/nlParser.ts`) purely as a stable seam for
  future work — its only implementation, `LocalMockNaturalLanguageLogParser`,
  makes no network call and returns nothing. A real implementation must
  not embed a provider API key in this frontend bundle; it would need a
  backend/API proxy the user controls. That's a V2+ decision, not made here.

## 12. Future cloud sync (not implemented, not precluded)

Nothing here assumes a single device forever, even though V1 is
single-device: every entry already has a stable UUID (`id`, via `uuid()`
at creation) and an `updatedAt` timestamp, which is the minimum vocabulary
a future sync protocol (last-write-wins or CRDT-based) needs for conflict
resolution. `EntrySource` already has a `'device'` value reserved for a
future health-platform import. The backup/import format
(`BackupEnvelope`) is intentionally the same shape a sync payload would
use, so "export/import" and "sync" are the same serialization with a
different transport.
