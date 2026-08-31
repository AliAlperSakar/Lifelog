import type { Aggregate } from '../domain/aggregate'
import { sumContributions } from '../domain/aggregate'
import type { LogEntry, LogEntryOfCategory, SleepQuality, SubjectiveSubtype } from '../domain/types'
import { minutesBetween } from '../utils/date'

/** Pure, testable aggregation logic. Every function here takes the entries
 * for a single local day (already filtered by the caller/repository) and
 * derives a summary. None of these touch IndexedDB — they are plain
 * functions over arrays, which is what makes them easy to unit test and
 * safe to reuse for both the Today screen and Trends. */

function byCategory<C extends LogEntry['category']>(entries: LogEntry[], category: C): LogEntryOfCategory<C>[] {
  return entries.filter((e): e is LogEntryOfCategory<C> => e.category === category)
}

export interface DailyNutrition {
  calories?: Aggregate
  proteinG?: Aggregate
  carbsG?: Aggregate
  fatG?: Aggregate
  fiberG?: Aggregate
  sugarG?: Aggregate
  foodEntryCount: number
}

export function calculateDailyNutrition(entries: LogEntry[]): DailyNutrition {
  const food = byCategory(entries, 'food')
  const drinks = byCategory(entries, 'drink')

  const calorieContribs = [
    ...food.map((e) => ({ value: e.detail.calories, approximate: e.measurementStatus === 'approximate' })),
    ...drinks.map((e) => ({ value: e.detail.calories, approximate: e.measurementStatus === 'approximate' })),
  ]
  const sugarContribs = [
    ...food.map((e) => ({ value: e.detail.sugarG, approximate: e.measurementStatus === 'approximate' })),
    ...drinks.map((e) => ({ value: e.detail.sugarG, approximate: e.measurementStatus === 'approximate' })),
  ]

  return {
    calories: sumContributions(calorieContribs),
    proteinG: sumContributions(food.map((e) => ({ value: e.detail.proteinG, approximate: e.measurementStatus === 'approximate' }))),
    carbsG: sumContributions(food.map((e) => ({ value: e.detail.carbsG, approximate: e.measurementStatus === 'approximate' }))),
    fatG: sumContributions(food.map((e) => ({ value: e.detail.fatG, approximate: e.measurementStatus === 'approximate' }))),
    fiberG: sumContributions(food.map((e) => ({ value: e.detail.fiberG, approximate: e.measurementStatus === 'approximate' }))),
    sugarG: sumContributions(sugarContribs),
    foodEntryCount: food.length,
  }
}

export function calculateDailyWater(entries: LogEntry[]): Aggregate | undefined {
  const water = byCategory(entries, 'water')
  return sumContributions(water.map((e) => ({ value: e.detail.volumeMl, approximate: false })))
}

export function calculateDailyFluids(entries: LogEntry[]): Aggregate | undefined {
  const water = byCategory(entries, 'water')
  const drinks = byCategory(entries, 'drink')
  return sumContributions([
    ...water.map((e) => ({ value: e.detail.volumeMl, approximate: false })),
    ...drinks.map((e) => ({ value: e.detail.volumeMl, approximate: e.measurementStatus === 'approximate' })),
  ])
}

export function calculateDailyCaffeine(entries: LogEntry[]): Aggregate | undefined {
  const drinks = byCategory(entries, 'drink')
  // Only drinks where caffeineMg was actually entered contribute — a coffee
  // with no caffeine value given must not be treated as 0mg.
  return sumContributions(
    drinks
      .filter((e) => e.detail.caffeineMg !== undefined)
      .map((e) => ({ value: e.detail.caffeineMg, approximate: e.measurementStatus === 'approximate' })),
  )
}

export function calculateDailySteps(entries: LogEntry[]): Aggregate | undefined {
  const steps = byCategory(entries, 'steps')
  return sumContributions(steps.map((e) => ({ value: e.detail.steps, approximate: false })))
}

export interface DailyActivity {
  durationMin?: Aggregate
  estimatedKcal?: Aggregate
  sessionCount: number
}

export function calculateDailyActivity(entries: LogEntry[]): DailyActivity {
  const activity = byCategory(entries, 'activity')
  const running = byCategory(entries, 'running')
  const strength = byCategory(entries, 'strength')

  const durationContribs = [
    ...activity.map((e) => ({ value: e.detail.durationMin, approximate: true })),
    ...running.map((e) => ({ value: e.detail.durationMin, approximate: true })),
    ...strength.map((e) => ({ value: e.detail.durationMin, approximate: true })),
  ]
  const kcalContribs = [
    ...activity.map((e) => ({ value: e.detail.estimatedKcal, approximate: true })),
    ...running.map((e) => ({ value: e.detail.estimatedKcal, approximate: true })),
  ]

  return {
    durationMin: sumContributions(durationContribs),
    estimatedKcal: sumContributions(kcalContribs),
    sessionCount: activity.length + running.length + strength.length,
  }
}

export interface DailyRunning {
  distanceKm?: Aggregate
  durationMin?: Aggregate
  sessionCount: number
  avgPaceMinPerKm?: number
}

export function calculateDailyRunning(entries: LogEntry[]): DailyRunning {
  const running = byCategory(entries, 'running')
  const distance = sumContributions(running.map((e) => ({ value: e.detail.distanceKm, approximate: true })))
  const duration = sumContributions(running.map((e) => ({ value: e.detail.durationMin, approximate: true })))
  return {
    distanceKm: distance,
    durationMin: duration,
    sessionCount: running.length,
    avgPaceMinPerKm: distance && duration && distance.value > 0 ? duration.value / distance.value : undefined,
  }
}

export interface DailySleep {
  minutes?: number
  approximate: boolean
  reportedText?: string
  quality?: SleepQuality
}

export function calculateDailySleep(entries: LogEntry[]): DailySleep | undefined {
  const sleep = byCategory(entries, 'sleep')
  if (sleep.length === 0) return undefined
  // Typically one sleep entry per day; if several exist, sum durations.
  let totalMinutes: number | undefined
  let approximate = false
  let reportedText: string | undefined
  let lastQuality: SleepQuality | undefined

  for (const e of sleep) {
    if (e.detail.reportedDurationMin !== undefined) {
      totalMinutes = (totalMinutes ?? 0) + e.detail.reportedDurationMin
      approximate = true
      reportedText = e.detail.reportedDurationText ?? reportedText
    } else if (e.detail.bedTime && e.detail.wakeTime) {
      totalMinutes = (totalMinutes ?? 0) + minutesBetween(e.detail.bedTime, e.detail.wakeTime)
    }
    if (e.detail.quality) lastQuality = e.detail.quality
  }

  if (totalMinutes === undefined && lastQuality === undefined) return undefined
  return { minutes: totalMinutes, approximate, reportedText, quality: lastQuality }
}

export interface SubjectiveSummary {
  bySubtype: Partial<Record<SubjectiveSubtype, Aggregate>>
}

export function calculateSubjectiveSummary(entries: LogEntry[]): SubjectiveSummary {
  const subjective = byCategory(entries, 'subjective')
  const subtypes: SubjectiveSubtype[] = ['mood', 'energy', 'appetite', 'concentration', 'stress', 'wellbeing']
  const bySubtype: Partial<Record<SubjectiveSubtype, Aggregate>> = {}
  for (const st of subtypes) {
    const matching = subjective.filter((e) => e.subtype === st)
    const agg = sumContributions(matching.map((e) => ({ value: e.detail.rating, approximate: false })))
    if (agg) {
      bySubtype[st] = { ...agg, value: agg.value / matching.length }
    }
  }
  return { bySubtype }
}

export function calculateDailyNicotine(entries: LogEntry[]): Aggregate | undefined {
  const nicotine = byCategory(entries, 'nicotine')
  return sumContributions(nicotine.map((e) => ({ value: e.detail.count ?? 1, approximate: false })))
}

export function calculateDailyAlcoholUnits(entries: LogEntry[]): Aggregate | undefined {
  const alcohol = byCategory(entries, 'alcohol')
  return sumContributions(
    alcohol.filter((e) => e.detail.units !== undefined).map((e) => ({ value: e.detail.units, approximate: true })),
  )
}

export function calculateDailyCannabisCount(entries: LogEntry[]): Aggregate | undefined {
  const cannabis = byCategory(entries, 'cannabis')
  if (cannabis.length === 0) return undefined
  return { value: cannabis.length, approximate: false, entryCount: cannabis.length }
}

export function latestWeightEntry(entries: LogEntry[]): LogEntryOfCategory<'weight'> | undefined {
  const weights = byCategory(entries, 'weight')
  if (weights.length === 0) return undefined
  return [...weights].sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0]
}

export interface DailySummary {
  nutrition: DailyNutrition
  water?: Aggregate
  fluids?: Aggregate
  caffeineMg?: Aggregate
  steps?: Aggregate
  activity: DailyActivity
  running: DailyRunning
  sleep?: DailySleep
  subjective: SubjectiveSummary
  nicotine?: Aggregate
  alcoholUnits?: Aggregate
  cannabisCount?: Aggregate
  weight?: LogEntryOfCategory<'weight'>
  entryCount: number
}

export function calculateDailySummary(entries: LogEntry[]): DailySummary {
  return {
    nutrition: calculateDailyNutrition(entries),
    water: calculateDailyWater(entries),
    fluids: calculateDailyFluids(entries),
    caffeineMg: calculateDailyCaffeine(entries),
    steps: calculateDailySteps(entries),
    activity: calculateDailyActivity(entries),
    running: calculateDailyRunning(entries),
    sleep: calculateDailySleep(entries),
    subjective: calculateSubjectiveSummary(entries),
    nicotine: calculateDailyNicotine(entries),
    alcoholUnits: calculateDailyAlcoholUnits(entries),
    cannabisCount: calculateDailyCannabisCount(entries),
    weight: latestWeightEntry(entries),
    entryCount: entries.length,
  }
}
