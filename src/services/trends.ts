import type { LogEntry } from '../domain/types'
import { calculateDailySummary } from './aggregation'

export const TREND_METRICS = [
  'calories',
  'protein',
  'carbs',
  'fat',
  'fiber',
  'sugar',
  'water',
  'fluids',
  'sleep',
  'caffeine',
  'nicotine',
  'cannabis',
  'alcohol',
  'steps',
  'running_distance',
  'running_frequency',
  'exercise_frequency',
  'strength_sessions',
  'mood',
  'energy',
  'appetite',
  'concentration',
  'weight',
] as const

export type TrendMetric = (typeof TREND_METRICS)[number]

export const TREND_METRIC_LABELS: Record<TrendMetric, string> = {
  calories: 'Calories',
  protein: 'Protein',
  carbs: 'Carbs',
  fat: 'Fat',
  fiber: 'Fiber',
  sugar: 'Sugar',
  water: 'Water',
  fluids: 'Total fluids',
  sleep: 'Sleep',
  caffeine: 'Caffeine',
  nicotine: 'Nicotine',
  cannabis: 'Cannabis',
  alcohol: 'Alcohol',
  steps: 'Steps',
  running_distance: 'Running distance',
  running_frequency: 'Running sessions',
  exercise_frequency: 'Exercise sessions',
  strength_sessions: 'Strength sessions',
  mood: 'Mood',
  energy: 'Energy',
  appetite: 'Appetite',
  concentration: 'Concentration',
  weight: 'Weight',
}

export const TREND_METRIC_UNITS: Partial<Record<TrendMetric, string>> = {
  calories: 'kcal',
  protein: 'g',
  carbs: 'g',
  fat: 'g',
  fiber: 'g',
  sugar: 'g',
  water: 'ml',
  fluids: 'ml',
  sleep: 'min',
  caffeine: 'mg',
  steps: 'steps',
  running_distance: 'km',
  weight: 'kg',
}

export interface TrendPoint {
  date: string
  value?: number
  approximate: boolean
  logged: boolean
}

function metricValue(metric: TrendMetric, entries: LogEntry[]): { value?: number; approximate: boolean; logged: boolean } {
  const s = calculateDailySummary(entries)
  switch (metric) {
    case 'calories':
      return s.nutrition.calories
        ? { value: s.nutrition.calories.value, approximate: s.nutrition.calories.approximate, logged: true }
        : { logged: false, approximate: false }
    case 'protein':
      return s.nutrition.proteinG
        ? { value: s.nutrition.proteinG.value, approximate: s.nutrition.proteinG.approximate, logged: true }
        : { logged: false, approximate: false }
    case 'carbs':
      return s.nutrition.carbsG
        ? { value: s.nutrition.carbsG.value, approximate: s.nutrition.carbsG.approximate, logged: true }
        : { logged: false, approximate: false }
    case 'fat':
      return s.nutrition.fatG
        ? { value: s.nutrition.fatG.value, approximate: s.nutrition.fatG.approximate, logged: true }
        : { logged: false, approximate: false }
    case 'fiber':
      return s.nutrition.fiberG
        ? { value: s.nutrition.fiberG.value, approximate: s.nutrition.fiberG.approximate, logged: true }
        : { logged: false, approximate: false }
    case 'sugar':
      return s.nutrition.sugarG
        ? { value: s.nutrition.sugarG.value, approximate: s.nutrition.sugarG.approximate, logged: true }
        : { logged: false, approximate: false }
    case 'water':
      return s.water ? { value: s.water.value, approximate: s.water.approximate, logged: true } : { logged: false, approximate: false }
    case 'fluids':
      return s.fluids ? { value: s.fluids.value, approximate: s.fluids.approximate, logged: true } : { logged: false, approximate: false }
    case 'sleep':
      return s.sleep?.minutes !== undefined
        ? { value: s.sleep.minutes, approximate: s.sleep.approximate, logged: true }
        : { logged: false, approximate: false }
    case 'caffeine':
      return s.caffeineMg
        ? { value: s.caffeineMg.value, approximate: s.caffeineMg.approximate, logged: true }
        : { logged: false, approximate: false }
    case 'nicotine':
      return s.nicotine ? { value: s.nicotine.value, approximate: false, logged: true } : { logged: false, approximate: false }
    case 'cannabis':
      return s.cannabisCount ? { value: s.cannabisCount.value, approximate: false, logged: true } : { logged: false, approximate: false }
    case 'alcohol':
      return s.alcoholUnits ? { value: s.alcoholUnits.value, approximate: true, logged: true } : { logged: false, approximate: false }
    case 'steps':
      return s.steps ? { value: s.steps.value, approximate: false, logged: true } : { logged: false, approximate: false }
    case 'running_distance':
      return s.running.distanceKm
        ? { value: s.running.distanceKm.value, approximate: true, logged: true }
        : { logged: false, approximate: false }
    case 'running_frequency':
      return s.running.sessionCount > 0 ? { value: s.running.sessionCount, approximate: false, logged: true } : { logged: false, approximate: false }
    case 'exercise_frequency':
      return s.activity.sessionCount > 0 ? { value: s.activity.sessionCount, approximate: false, logged: true } : { logged: false, approximate: false }
    case 'strength_sessions': {
      const strengthCount = entries.filter((e) => e.category === 'strength').length
      return strengthCount > 0 ? { value: strengthCount, approximate: false, logged: true } : { logged: false, approximate: false }
    }
    case 'mood':
    case 'energy':
    case 'appetite':
    case 'concentration': {
      const agg = s.subjective.bySubtype[metric]
      return agg ? { value: agg.value, approximate: false, logged: true } : { logged: false, approximate: false }
    }
    case 'weight':
      return s.weight ? { value: s.weight.detail.weightKg, approximate: s.weight.measurementStatus === 'approximate', logged: true } : { logged: false, approximate: false }
    default:
      return { logged: false, approximate: false }
  }
}

/** Builds one point per date in `dates`, deriving each day's value purely
 * from that day's entries. Missing days are `logged: false` — they are
 * excluded from averages, never treated as 0. */
export function calculateTrendSeries(dates: string[], entriesByDate: Map<string, LogEntry[]>, metric: TrendMetric): TrendPoint[] {
  return dates.map((date) => {
    const entries = entriesByDate.get(date) ?? []
    const m = metricValue(metric, entries)
    return { date, value: m.value, approximate: m.approximate, logged: m.logged }
  })
}

export interface RangeAverage {
  average?: number
  loggedDays: number
  totalDays: number
}

export function calculateDateRangeAverage(series: TrendPoint[]): RangeAverage {
  const logged = series.filter((p) => p.logged && p.value !== undefined)
  if (logged.length === 0) return { loggedDays: 0, totalDays: series.length }
  const sum = logged.reduce((acc, p) => acc + (p.value ?? 0), 0)
  return { average: sum / logged.length, loggedDays: logged.length, totalDays: series.length }
}

export function groupEntriesByDate(entries: LogEntry[]): Map<string, LogEntry[]> {
  const map = new Map<string, LogEntry[]>()
  for (const e of entries) {
    const arr = map.get(e.localDate)
    if (arr) arr.push(e)
    else map.set(e.localDate, [e])
  }
  return map
}
