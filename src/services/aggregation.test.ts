import { describe, expect, it } from 'vitest'
import {
  calculateDailyCaffeine,
  calculateDailyNicotine,
  calculateDailyNutrition,
  calculateDailyRunning,
  calculateDailySleep,
  calculateDailySteps,
  calculateDailyWater,
} from './aggregation'
import type { LogEntry } from '../domain/types'

function food(overrides: Partial<Extract<LogEntry, { category: 'food' }>> = {}): LogEntry {
  return {
    id: overrides.id ?? 'f1',
    category: 'food',
    subtype: 'meal',
    timestamp: '2026-08-31T12:00:00+02:00',
    localDate: '2026-08-31',
    title: 'Test food',
    detail: { calories: 500, proteinG: 20, carbsG: 40, fatG: 10, fiberG: 5, sugarG: 8 },
    source: 'manual',
    measurementStatus: 'exact',
    confidence: 'high',
    createdAt: '2026-08-31T12:00:00+02:00',
    updatedAt: '2026-08-31T12:00:00+02:00',
    ...overrides,
  } as LogEntry
}

function drink(overrides: Partial<Extract<LogEntry, { category: 'drink' }>> = {}): LogEntry {
  return {
    id: overrides.id ?? 'd1',
    category: 'drink',
    subtype: 'coffee',
    timestamp: '2026-08-31T09:00:00+02:00',
    localDate: '2026-08-31',
    title: 'Coffee',
    detail: { volumeMl: 200, caffeineMg: 80 },
    source: 'manual',
    measurementStatus: 'approximate',
    confidence: 'medium',
    createdAt: '2026-08-31T09:00:00+02:00',
    updatedAt: '2026-08-31T09:00:00+02:00',
    ...overrides,
  } as LogEntry
}

describe('calculateDailyNutrition', () => {
  it('sums calories, protein, carbs, fat, fiber, sugar across food entries', () => {
    const entries = [food({ id: 'f1' }), food({ id: 'f2', detail: { calories: 300, proteinG: 10, carbsG: 20, fatG: 5, fiberG: 2, sugarG: 4 } })]
    const result = calculateDailyNutrition(entries)
    expect(result.calories?.value).toBe(800)
    expect(result.proteinG?.value).toBe(30)
    expect(result.carbsG?.value).toBe(60)
    expect(result.fatG?.value).toBe(15)
    expect(result.fiberG?.value).toBe(7)
    expect(result.sugarG?.value).toBe(12)
  })

  it('includes drink calories/sugar in daily totals without double counting caffeine', () => {
    const entries = [food(), drink({ detail: { volumeMl: 330, calories: 140, sugarG: 35, caffeineMg: 34 } })]
    const result = calculateDailyNutrition(entries)
    expect(result.calories?.value).toBe(640)
    expect(result.sugarG?.value).toBe(43)
  })

  it('leaves fields undefined (not zero) when nothing contributes', () => {
    const result = calculateDailyNutrition([])
    expect(result.calories).toBeUndefined()
    expect(result.fiberG).toBeUndefined()
  })

  it('marks the aggregate approximate when any contributing entry is approximate', () => {
    const entries = [food({ measurementStatus: 'exact' }), food({ id: 'f2', measurementStatus: 'approximate' })]
    expect(calculateDailyNutrition(entries).calories?.approximate).toBe(true)
  })
})

describe('calculateDailyWater', () => {
  it('sums water volumes', () => {
    const entries: LogEntry[] = [
      { id: 'w1', category: 'water', timestamp: 't', localDate: '2026-08-31', detail: { volumeMl: 250 }, createdAt: 't', updatedAt: 't' },
      { id: 'w2', category: 'water', timestamp: 't', localDate: '2026-08-31', detail: { volumeMl: 500 }, createdAt: 't', updatedAt: 't' },
    ]
    expect(calculateDailyWater(entries)?.value).toBe(750)
  })

  it('is undefined (not logged) when there are no water entries, never 0', () => {
    expect(calculateDailyWater([])).toBeUndefined()
  })
})

describe('calculateDailyCaffeine', () => {
  it('sums only drinks with an explicit caffeineMg value', () => {
    const withCaffeine = drink({ id: 'd1', detail: { volumeMl: 200, caffeineMg: 80 } })
    const withoutCaffeine = drink({ id: 'd2', subtype: 'juice', detail: { volumeMl: 200 } })
    const result = calculateDailyCaffeine([withCaffeine, withoutCaffeine])
    expect(result?.value).toBe(80)
    expect(result?.entryCount).toBe(1)
  })

  it('derives caffeine from the drink entry rather than requiring a second event', () => {
    // A Coca-Cola drink entry already carries caffeineMg; there is no
    // separate "caffeine" category, so no double counting is possible.
    const cola = drink({ id: 'cola', subtype: 'soda', detail: { volumeMl: 330, calories: 140, sugarG: 35, caffeineMg: 34 } })
    expect(calculateDailyCaffeine([cola])?.value).toBe(34)
  })
})

describe('calculateDailySteps', () => {
  it('sums incremental step entries', () => {
    const entries: LogEntry[] = [
      { id: 's1', category: 'steps', timestamp: 't', localDate: '2026-08-31', detail: { steps: 3500 }, createdAt: 't', updatedAt: 't' },
      { id: 's2', category: 'steps', timestamp: 't', localDate: '2026-08-31', detail: { steps: 2000 }, createdAt: 't', updatedAt: 't' },
    ]
    expect(calculateDailySteps(entries)?.value).toBe(5500)
  })
})

describe('calculateDailyRunning', () => {
  it('sums distance and duration across running entries', () => {
    const entries: LogEntry[] = [
      { id: 'r1', category: 'running', timestamp: 't', localDate: '2026-08-31', detail: { distanceKm: 5, durationMin: 30 }, createdAt: 't', updatedAt: 't' },
    ]
    const result = calculateDailyRunning(entries)
    expect(result.distanceKm?.value).toBe(5)
    expect(result.durationMin?.value).toBe(30)
    expect(result.sessionCount).toBe(1)
    expect(result.avgPaceMinPerKm).toBe(6)
  })
})

describe('calculateDailySleep', () => {
  it('preserves a reported approximate duration rather than replacing it with a calculation', () => {
    const entries: LogEntry[] = [
      {
        id: 'sl1',
        category: 'sleep',
        timestamp: 't',
        localDate: '2026-08-31',
        detail: { reportedDurationMin: 450, reportedDurationText: '7-8 hours', quality: 4 },
        createdAt: 't',
        updatedAt: 't',
      },
    ]
    const result = calculateDailySleep(entries)
    expect(result?.minutes).toBe(450)
    expect(result?.approximate).toBe(true)
    expect(result?.reportedText).toBe('7-8 hours')
  })

  it('calculates duration from bed/wake time when no reported duration is given', () => {
    const entries: LogEntry[] = [
      {
        id: 'sl2',
        category: 'sleep',
        timestamp: 't',
        localDate: '2026-08-31',
        detail: { bedTime: '2026-08-30T23:30:00+02:00', wakeTime: '2026-08-31T07:30:00+02:00' },
        createdAt: 't',
        updatedAt: 't',
      },
    ]
    const result = calculateDailySleep(entries)
    expect(result?.minutes).toBe(480)
    expect(result?.approximate).toBe(false)
  })
})

describe('calculateDailyNicotine', () => {
  it('treats an explicitly logged zero as a real zero, not missing data', () => {
    const entries: LogEntry[] = [
      { id: 'n1', category: 'nicotine', subtype: 'cigarette', timestamp: 't', localDate: '2026-08-31', detail: { count: 0 }, createdAt: 't', updatedAt: 't' },
    ]
    const result = calculateDailyNicotine(entries)
    expect(result).toBeDefined()
    expect(result?.value).toBe(0)
  })

  it('is undefined when nothing was logged at all', () => {
    expect(calculateDailyNicotine([])).toBeUndefined()
  })
})
