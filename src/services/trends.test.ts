import { describe, expect, it } from 'vitest'
import { calculateDateRangeAverage, calculateTrendSeries, groupEntriesByDate } from './trends'
import type { LogEntry } from '../domain/types'

function foodOn(date: string, calories: number): LogEntry {
  return {
    id: `f-${date}`,
    category: 'food',
    subtype: 'meal',
    timestamp: `${date}T12:00:00+02:00`,
    localDate: date,
    detail: { calories },
    source: 'manual',
    measurementStatus: 'exact',
    confidence: 'high',
    createdAt: `${date}T12:00:00+02:00`,
    updatedAt: `${date}T12:00:00+02:00`,
  } as LogEntry
}

describe('calculateTrendSeries + calculateDateRangeAverage', () => {
  it('ignores unlogged days when averaging rather than treating them as zero', () => {
    const dates = ['2026-08-29', '2026-08-30', '2026-08-31']
    const entries = [foodOn('2026-08-29', 2000), foodOn('2026-08-31', 3000)]
    // 2026-08-30 has no entries at all.
    const byDate = groupEntriesByDate(entries)
    const series = calculateTrendSeries(dates, byDate, 'calories')

    expect(series[1].logged).toBe(false)
    expect(series[1].value).toBeUndefined()

    const avg = calculateDateRangeAverage(series)
    expect(avg.loggedDays).toBe(2)
    expect(avg.totalDays).toBe(3)
    // (2000 + 3000) / 2 = 2500, NOT (2000+0+3000)/3
    expect(avg.average).toBe(2500)
  })

  it('returns an undefined average when no days in range were logged', () => {
    const series = calculateTrendSeries(['2026-08-01'], new Map(), 'calories')
    const avg = calculateDateRangeAverage(series)
    expect(avg.average).toBeUndefined()
    expect(avg.loggedDays).toBe(0)
  })
})

describe('groupEntriesByDate', () => {
  it('groups entries by their localDate, not by parsing timestamp again', () => {
    const entries = [foodOn('2026-08-31', 100), foodOn('2026-08-31', 200), foodOn('2026-09-01', 300)]
    const grouped = groupEntriesByDate(entries)
    expect(grouped.get('2026-08-31')).toHaveLength(2)
    expect(grouped.get('2026-09-01')).toHaveLength(1)
  })
})
