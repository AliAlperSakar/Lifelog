import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../db/database'
import { logEntryRepository } from './logEntryRepository'
import { calculateDailyNutrition } from '../services/aggregation'

beforeEach(async () => {
  await db.entries.clear()
})

describe('logEntryRepository + aggregation integration', () => {
  it('recalculates daily totals after editing an entry', async () => {
    const entry = await logEntryRepository.create({
      category: 'food',
      subtype: 'meal',
      timestamp: '2026-08-31T12:00:00+02:00',
      title: 'Banana',
      detail: { calories: 105, proteinG: 1.3, carbsG: 27, fatG: 0.3, fiberG: 3.1, sugarG: 14 },
      source: 'manual',
      measurementStatus: 'approximate',
      confidence: 'medium',
    })

    let entries = await logEntryRepository.getForDate('2026-08-31')
    expect(calculateDailyNutrition(entries).calories?.value).toBe(105)

    await logEntryRepository.update(entry.id, { detail: { ...entry.detail, calories: 120 } } as never)

    entries = await logEntryRepository.getForDate('2026-08-31')
    expect(calculateDailyNutrition(entries).calories?.value).toBe(120)
  })

  it('recalculates daily totals after deleting an entry, returning to the previous state', async () => {
    const a = await logEntryRepository.create({
      category: 'food',
      subtype: 'meal',
      timestamp: '2026-08-31T08:00:00+02:00',
      title: 'Eggs',
      detail: { calories: 150 },
      source: 'manual',
      measurementStatus: 'exact',
      confidence: 'high',
    })
    await logEntryRepository.create({
      category: 'food',
      subtype: 'snack',
      timestamp: '2026-08-31T15:00:00+02:00',
      title: 'Banana',
      detail: { calories: 105 },
      source: 'manual',
      measurementStatus: 'approximate',
      confidence: 'medium',
    })

    let entries = await logEntryRepository.getForDate('2026-08-31')
    expect(calculateDailyNutrition(entries).calories?.value).toBe(255)

    await logEntryRepository.remove(a.id)

    entries = await logEntryRepository.getForDate('2026-08-31')
    expect(calculateDailyNutrition(entries).calories?.value).toBe(105)
  })

  it('groups entries by their correct local date', async () => {
    await logEntryRepository.create({ category: 'water', timestamp: '2026-08-30T23:50:00+02:00', detail: { volumeMl: 200 } })
    await logEntryRepository.create({ category: 'water', timestamp: '2026-08-31T00:10:00+02:00', detail: { volumeMl: 300 } })

    const day30 = await logEntryRepository.getForDate('2026-08-30')
    const day31 = await logEntryRepository.getForDate('2026-08-31')
    expect(day30).toHaveLength(1)
    expect(day31).toHaveLength(1)
  })
})
