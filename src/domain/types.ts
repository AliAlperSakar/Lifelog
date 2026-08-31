/**
 * Core domain model.
 *
 * Design decisions (see docs/architecture.md for the full rationale):
 *  - Everything the user records is a `LogEntry` — a flexible, timestamped
 *    event. Category-specific data lives in a typed `detail` object rather
 *    than a flat bag of optional fields, so each category stays strongly
 *    typed while the storage/aggregation layers can still treat all entries
 *    uniformly as "events on a timeline".
 *  - Body weight and other measurements are just LogEntries with
 *    category "weight" — there is no separate BodyMeasurement table. This
 *    avoids fragmenting simple facts across multiple stores.
 *  - Uncertainty is tracked at the entry level (`measurementStatus`,
 *    `source`, `confidence`) rather than per-field. A user says "about
 *    150g of pasta", not "exactly 150g of carbs, approximately of
 *    protein" — the whole entry is one estimate.
 *  - Missing data is `undefined`/absent, never `0`. A field that was never
 *    entered must never be treated as a logged zero. Aggregation code must
 *    preserve this distinction (see services/aggregation.ts).
 */

export type Id = string

export type MeasurementStatus = 'exact' | 'approximate'

export type EntrySource =
  | 'manual'
  | 'label'
  | 'database'
  | 'ai'
  | 'calculated'
  | 'device'
  | 'demo'

export type Confidence = 'low' | 'medium' | 'high'

/** Shared provenance metadata for any entry whose values may be estimated. */
export interface Provenance {
  source: EntrySource
  measurementStatus: MeasurementStatus
  confidence: Confidence
}

export const CATEGORIES = [
  'food',
  'drink',
  'water',
  'activity',
  'running',
  'strength',
  'steps',
  'sleep',
  'nicotine',
  'cannabis',
  'alcohol',
  'subjective',
  'symptom',
  'weight',
  'note',
] as const

export type LogCategory = (typeof CATEGORIES)[number]

// ---------------------------------------------------------------------------
// Category detail payloads
// ---------------------------------------------------------------------------

export interface NutritionDetail {
  calories?: number
  proteinG?: number
  carbsG?: number
  fatG?: number
  fiberG?: number
  sugarG?: number
  sodiumMg?: number
  calciumMg?: number
  ironMg?: number
  potassiumMg?: number
  magnesiumMg?: number
  omega3Mg?: number
  micronutrientNote?: string
}

export type FoodSubtype = 'meal' | 'snack'

export interface FoodDetail extends NutritionDetail {
  quantity?: number
  unit?: string
}

export type DrinkSubtype = 'coffee' | 'tea' | 'soda' | 'energy_drink' | 'juice' | 'milk' | 'other'

export interface DrinkDetail {
  volumeMl?: number
  calories?: number
  sugarG?: number
  /** Caffeine, when this beverage is a caffeine source. Avoids a separate
   *  "caffeine" event that would double-count against the drink itself. */
  caffeineMg?: number
}

export interface WaterDetail {
  volumeMl: number
}

export type ActivitySubtype =
  | 'walking'
  | 'mobility'
  | 'stretching'
  | 'cycling'
  | 'swimming'
  | 'physical_work'
  | 'other'

export type Intensity = 'low' | 'moderate' | 'high'

export interface ActivityDetail {
  durationMin?: number
  distanceKm?: number
  intensity?: Intensity
  estimatedKcal?: number
}

export interface RunningDetail {
  distanceKm?: number
  durationMin?: number
  /** Derived when both distance and duration are present; not stored twice. */
  estimatedKcal?: number
}

/** Common leg/knee-supporting exercises get first-class presets; anything
 *  else can be typed as a custom name. Sets/reps/weight are all optional —
 *  this is a training log, not a programming tool. */
export const STRENGTH_EXERCISE_PRESETS = [
  'Squats',
  'Split squats',
  'Calf raises',
  'Tibialis raises',
  'Knee extensions',
  'Hamstring curls',
  'Lunges',
  'Glute bridges',
  'Mobility work',
  'Stretching',
] as const

export interface StrengthExercise {
  name: string
  sets?: number
  reps?: number
  weightKg?: number
}

export type StrengthFocus = 'legs_knee' | 'general'

export interface StrengthDetail {
  focus?: StrengthFocus
  durationMin?: number
  exercises?: StrengthExercise[]
}

export interface StepsDetail {
  steps: number
}

export type SleepQuality = 1 | 2 | 3 | 4 | 5

export const SLEEP_QUALITY_LABELS: Record<SleepQuality, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very good',
  5: 'Excellent',
}

export interface SleepDetail {
  bedTime?: string // ISO timestamp
  wakeTime?: string // ISO timestamp
  /** Free-text/approximate duration as reported by the user, e.g. "7-8" hours
   *  preserved as a range rather than collapsed to a single number. */
  reportedDurationMin?: number
  reportedDurationText?: string
  quality?: SleepQuality
}

export type NicotineSubtype = 'cigarette' | 'vape' | 'pouch' | 'other'

export interface NicotineDetail {
  count?: number
  amountMg?: number
}

export type CannabisMethod = 'smoking' | 'vaporizer' | 'edible' | 'other'

export interface CannabisDetail {
  amount?: string
  method?: CannabisMethod
}

export interface AlcoholDetail {
  beverage?: string
  volumeMl?: number
  abvPercent?: number
  /** Standard drink units, derived from volume x abv when both are known. */
  units?: number
}

export type SubjectiveSubtype = 'mood' | 'energy' | 'appetite' | 'concentration' | 'stress' | 'wellbeing'

export interface SubjectiveDetail {
  /** 1-5 for every subtype, including appetite (mapped to labels in the UI). */
  rating: 1 | 2 | 3 | 4 | 5
}

export const APPETITE_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: 'Very low',
  2: 'Low',
  3: 'Normal',
  4: 'High',
  5: 'Very high',
}

export type SymptomSubtype =
  | 'headache'
  | 'stomach'
  | 'nausea'
  | 'soreness'
  | 'knee'
  | 'muscle'
  | 'fatigue'
  | 'back'
  | 'other'

export interface SymptomDetail {
  severity?: 1 | 2 | 3 | 4 | 5
  durationMin?: number
}

export interface WeightDetail {
  weightKg: number
}

export interface NoteDetail {
  text: string
}

// ---------------------------------------------------------------------------
// The unified LogEntry
// ---------------------------------------------------------------------------

interface LogEntryBase {
  id: Id
  /** Absolute instant, ISO 8601 with offset. */
  timestamp: string
  /** Local calendar date the entry belongs to, YYYY-MM-DD. Computed from
   *  timestamp + the device's timezone at entry time, and never re-derived
   *  from timestamp with a different timezone later (see utils/date.ts). */
  localDate: string
  title?: string
  notes?: string
  createdAt: string
  updatedAt: string
  /** Marks seed/example data so it can be identified and removed distinctly
   *  from user-entered records. */
  isDemo?: boolean
}

export type LogEntry =
  | (LogEntryBase & { category: 'food'; subtype: FoodSubtype; detail: FoodDetail } & Provenance)
  | (LogEntryBase & { category: 'drink'; subtype: DrinkSubtype; detail: DrinkDetail } & Provenance)
  | (LogEntryBase & { category: 'water'; subtype?: undefined; detail: WaterDetail })
  | (LogEntryBase & { category: 'activity'; subtype: ActivitySubtype; detail: ActivityDetail })
  | (LogEntryBase & { category: 'running'; subtype?: undefined; detail: RunningDetail })
  | (LogEntryBase & { category: 'strength'; subtype?: undefined; detail: StrengthDetail })
  | (LogEntryBase & { category: 'steps'; subtype?: undefined; detail: StepsDetail })
  | (LogEntryBase & { category: 'sleep'; subtype?: undefined; detail: SleepDetail })
  | (LogEntryBase & { category: 'nicotine'; subtype: NicotineSubtype; detail: NicotineDetail })
  | (LogEntryBase & { category: 'cannabis'; subtype?: undefined; detail: CannabisDetail })
  | (LogEntryBase & { category: 'alcohol'; subtype?: undefined; detail: AlcoholDetail })
  | (LogEntryBase & { category: 'subjective'; subtype: SubjectiveSubtype; detail: SubjectiveDetail })
  | (LogEntryBase & { category: 'symptom'; subtype: SymptomSubtype; detail: SymptomDetail })
  | (LogEntryBase & { category: 'weight'; subtype?: undefined; detail: WeightDetail } & Partial<Provenance>)
  | (LogEntryBase & { category: 'note'; subtype?: undefined; detail: NoteDetail })

export type LogEntryOfCategory<C extends LogCategory> = Extract<LogEntry, { category: C }>

/**
 * A plain `Omit<Union, K>` collapses to the *intersection* of member keys
 * (that's how `keyof` works over a union), which silently drops
 * category-specific fields like `subtype`/`source` for members that don't
 * share them across every branch. This distributes the Omit over each
 * union member first, preserving per-category shape — used anywhere we
 * need "a LogEntry variant minus its generated fields" (repository create
 * input, quick-log form payloads).
 */
export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

// ---------------------------------------------------------------------------
// Profile / goals / settings
// ---------------------------------------------------------------------------

export type Sex = 'male' | 'female' | 'other' | 'prefer_not_to_say'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'

export interface UserProfile {
  id: 'profile'
  heightCm?: number
  heightApproximate?: boolean
  /** Fallback "current weight" shown until the user has any weight log
   *  entries; once entries exist, the latest entry wins. */
  seedWeightKg?: number
  seedWeightApproximate?: boolean
  age?: number
  sex?: Sex
  activityLevel?: ActivityLevel
  updatedAt: string
}

export type GoalType =
  | 'maintain_weight'
  | 'lose_weight'
  | 'gain_weight'
  | 'improve_protein'
  | 'improve_hydration'
  | 'run_consistently'
  | 'improve_knee_leg_strength'
  | 'improve_sleep'
  | 'reduce_nicotine'
  | 'reduce_alcohol'
  | 'improve_diet_quality'

export type GoalMetric = 'calories' | 'protein' | 'fiber' | 'water' | 'sleep' | 'steps' | 'running_distance' | 'weight'

export interface Goal {
  id: Id
  type: GoalType
  active: boolean
  targetMetric?: GoalMetric
  targetValue?: number
  createdAt: string
  updatedAt: string
}

export type ThemePreference = 'system' | 'light' | 'dark'

export interface AppSettings {
  id: 'app'
  theme: ThemePreference
  demoDataSeeded: boolean
  onboardingSeen: boolean
  updatedAt: string
}

// ---------------------------------------------------------------------------
// Backup / export envelope
// ---------------------------------------------------------------------------

export const BACKUP_SCHEMA_VERSION = 1

export interface BackupEnvelope {
  schema: 'lifelog-backup'
  schemaVersion: number
  exportedAt: string
  appVersion: string
  profile: UserProfile | null
  settings: AppSettings | null
  goals: Goal[]
  entries: LogEntry[]
}
