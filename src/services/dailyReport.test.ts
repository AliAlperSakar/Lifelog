import { describe, expect, it } from 'vitest'
import { generateDailyReport } from './dailyReport'
import type { LogEntry } from '../domain/types'

function food(id: string, title: string, detail: Partial<Extract<LogEntry, { category: 'food' }>['detail']>): LogEntry {
  return {
    id,
    category: 'food',
    subtype: 'meal',
    timestamp: '2026-08-31T18:00:00+02:00',
    localDate: '2026-08-31',
    title,
    detail,
    source: 'manual',
    measurementStatus: 'approximate',
    confidence: 'medium',
    createdAt: 't',
    updatedAt: 't',
  } as LogEntry
}

describe('generateDailyReport', () => {
  it('flags high protein as a positive and names the contributing foods', () => {
    const entries = [
      food('f1', 'Half dorado fish', { calories: 240, proteinG: 31 }),
      food('f2', '2 eggs', { calories: 150, proteinG: 13 }),
      food('f3', '150g beef', { calories: 350, proteinG: 38 }),
      food('f4', '200g yogurt', { calories: 260, proteinG: 20 }),
    ]
    const report = generateDailyReport('2026-08-31', entries)
    expect(report.wentWell.some((s) => s.includes('Protein'))).toBe(true)
    expect(report.wentWell.some((s) => s.includes('150g beef'))).toBe(true)
  })

  it('flags high sugar and low fiber as improvement areas, not moralizing language', () => {
    const entries = [food('f1', 'Cookies', { calories: 1500, sugarG: 120 })]
    const report = generateDailyReport('2026-08-31', entries)
    expect(report.couldImprove.some((s) => s.includes('Sugar'))).toBe(true)
    expect(report.tomorrow.some((s) => s.toLowerCase().includes('vegetable') || s.toLowerCase().includes('sugary'))).toBe(true)
    for (const s of [...report.wentWell, ...report.couldImprove, ...report.tomorrow]) {
      expect(s.toLowerCase()).not.toMatch(/should be ashamed|bad habit|you failed/)
    }
  })

  it('does not mention nicotine/alcohol in couldImprove unless a matching goal is active (no moralizing by default)', () => {
    const entries: LogEntry[] = [
      { id: 'n1', category: 'nicotine', subtype: 'cigarette', timestamp: 't', localDate: '2026-08-31', detail: { count: 3 }, createdAt: 't', updatedAt: 't' },
    ]
    const withoutGoal = generateDailyReport('2026-08-31', entries, [])
    expect(withoutGoal.couldImprove.some((s) => s.toLowerCase().includes('nicotine'))).toBe(false)

    const withGoal = generateDailyReport('2026-08-31', entries, [
      { id: 'g1', type: 'reduce_nicotine', active: true, createdAt: 't', updatedAt: 't' },
    ])
    expect(withGoal.couldImprove.some((s) => s.toLowerCase().includes('nicotine'))).toBe(true)
  })

  it('reports no food logged when the day has no food entries', () => {
    const report = generateDailyReport('2026-08-31', [])
    expect(report.food).toContain('No food logged for this day.')
  })
})
