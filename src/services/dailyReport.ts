import type { Goal, LogEntry } from '../domain/types'
import { calculateDailySummary } from './aggregation'
import { formatDuration } from '../utils/date'
import { formatApprox } from '../utils/format'

/**
 * Deterministic daily report. No LLM involved — every sentence is generated
 * from thresholds applied to the day's own aggregated numbers, and (where
 * relevant) references the actual entries that drove the number. Keeping
 * this rule-based means it's fully offline, fast, and testable, and it
 * never states a causal claim ("running caused X") — only what was logged.
 */

export interface DailyReport {
  localDate: string
  food: string[]
  activity: string[]
  lifestyle: string[]
  wentWell: string[]
  couldImprove: string[]
  tomorrow: string[]
}

function topContributors(entries: LogEntry[], field: 'proteinG' | 'sugarG', limit = 2): string[] {
  return entries
    .filter((e): e is Extract<LogEntry, { category: 'food' }> => e.category === 'food' && e.detail[field] !== undefined)
    .sort((a, b) => (b.detail[field] ?? 0) - (a.detail[field] ?? 0))
    .slice(0, limit)
    .map((e) => e.title ?? 'a food entry')
}

export function generateDailyReport(localDate: string, entries: LogEntry[], goals: Goal[] = []): DailyReport {
  const s = calculateDailySummary(entries)
  const food: string[] = []
  const activity: string[] = []
  const lifestyle: string[] = []
  const wentWell: string[] = []
  const couldImprove: string[] = []
  const tomorrow: string[] = []

  const activeGoalTypes = new Set(goals.filter((g) => g.active).map((g) => g.type))

  // --- Food -----------------------------------------------------------
  if (s.nutrition.calories) {
    food.push(`Estimated intake was ${formatApprox(s.nutrition.calories.value, s.nutrition.calories.approximate ? 'approximate' : 'exact')} kcal across ${s.nutrition.foodEntryCount} food entr${s.nutrition.foodEntryCount === 1 ? 'y' : 'ies'}.`)
    if (s.nutrition.proteinG) food.push(`Protein: ${formatApprox(s.nutrition.proteinG.value, 'approximate')} g.`)
    if (s.nutrition.carbsG) food.push(`Carbs: ${formatApprox(s.nutrition.carbsG.value, 'approximate')} g.`)
    if (s.nutrition.fatG) food.push(`Fat: ${formatApprox(s.nutrition.fatG.value, 'approximate')} g.`)
    if (s.nutrition.fiberG) food.push(`Fiber: ${formatApprox(s.nutrition.fiberG.value, 'approximate')} g.`)
    if (s.nutrition.sugarG) food.push(`Sugar: ${formatApprox(s.nutrition.sugarG.value, 'approximate')} g.`)
  } else {
    food.push('No food logged for this day.')
  }

  // --- Activity ---------------------------------------------------------
  if (s.steps) activity.push(`Steps: ~${Math.round(s.steps.value).toLocaleString()}.`)
  if (s.running.sessionCount > 0) {
    const dist = s.running.distanceKm ? ` (~${formatApprox(s.running.distanceKm.value, 'approximate', 1)} km)` : ''
    activity.push(`Running: ${s.running.sessionCount} session${s.running.sessionCount > 1 ? 's' : ''}${dist}.`)
  }
  const strengthCount = entries.filter((e) => e.category === 'strength').length
  if (strengthCount > 0) activity.push(`Strength/knee training: ${strengthCount} session${strengthCount > 1 ? 's' : ''}.`)
  if (s.activity.sessionCount === 0 && s.running.sessionCount === 0 && strengthCount === 0) {
    activity.push('No exercise logged for this day.')
  }

  // --- Lifestyle ----------------------------------------------------------
  if (s.sleep?.minutes !== undefined) {
    lifestyle.push(`Sleep: ${s.sleep.reportedText ?? `~${formatDuration(s.sleep.minutes)}`}.`)
  }
  if (s.fluids) lifestyle.push(`Fluids: ~${Math.round(s.fluids.value)} ml${s.water ? ` (water ~${Math.round(s.water.value)} ml)` : ''}.`)
  if (s.caffeineMg) lifestyle.push(`Caffeine: ~${Math.round(s.caffeineMg.value)} mg.`)
  if (s.nicotine) lifestyle.push(`Nicotine: ${s.nicotine.value} logged use${s.nicotine.value === 1 ? '' : 's'}.`)
  if (s.alcoholUnits) lifestyle.push(`Alcohol: ~${formatApprox(s.alcoholUnits.value, 'approximate', 1)} units.`)
  if (s.cannabisCount) lifestyle.push(`Cannabis: ${s.cannabisCount.value} logged use${s.cannabisCount.value === 1 ? '' : 's'}.`)

  // --- Went well (deterministic, most notable first, capped) -------------
  if (s.nutrition.proteinG && s.nutrition.proteinG.value >= 100) {
    const sources = topContributors(entries, 'proteinG')
    wentWell.push(
      `Protein intake was strong (~${Math.round(s.nutrition.proteinG.value)} g)${sources.length ? `, helped by ${sources.join(' and ')}.` : '.'}`,
    )
  }
  if (s.running.sessionCount > 0) wentWell.push('A running session was logged today.')
  if (strengthCount > 0 && entries.some((e) => e.category === 'strength' && e.detail.focus === 'legs_knee')) {
    wentWell.push('Leg/knee-focused training was completed.')
  }
  if (s.fluids && s.fluids.value >= 2000) wentWell.push('Hydration looked solid today.')
  if (s.sleep?.minutes !== undefined && s.sleep.minutes >= 420) wentWell.push(`Sleep duration looks solid (~${formatDuration(s.sleep.minutes)}).`)
  if (s.nutrition.fiberG && s.nutrition.fiberG.value >= 25) wentWell.push('Fiber intake was strong today.')

  // --- Could improve (deterministic, capped at 3, non-judgmental) --------
  if (s.nutrition.calories && s.nutrition.fiberG === undefined) {
    couldImprove.push('Fiber wasn’t tracked for any food today, so it’s hard to say how much was eaten.')
  } else if (s.nutrition.fiberG && s.nutrition.fiberG.value < 15) {
    couldImprove.push(`Fiber intake was low (~${Math.round(s.nutrition.fiberG.value)} g).`)
  }
  if (s.nutrition.sugarG && s.nutrition.sugarG.value > 80) {
    const sources = topContributors(entries, 'sugarG')
    couldImprove.push(`Sugar intake was high (~${Math.round(s.nutrition.sugarG.value)} g)${sources.length ? `, largely from ${sources.join(' and ')}.` : '.'}`)
  }
  if (!s.water && !s.fluids) couldImprove.push('Water wasn’t logged today, so hydration is unclear.')
  if (s.sleep?.minutes !== undefined && s.sleep.minutes < 360) couldImprove.push(`Sleep was short (~${formatDuration(s.sleep.minutes)}).`)
  if (activeGoalTypes.has('reduce_nicotine') && s.nicotine && s.nicotine.value > 0) {
    couldImprove.push(`Nicotine use was logged ${s.nicotine.value} time${s.nicotine.value === 1 ? '' : 's'}, above your goal of reducing use.`)
  }
  if (activeGoalTypes.has('reduce_alcohol') && s.alcoholUnits && s.alcoholUnits.value > 0) {
    couldImprove.push(`Alcohol was logged (~${formatApprox(s.alcoholUnits.value, 'approximate', 1)} units), above your goal of reducing use.`)
  }

  // --- Tomorrow (tied directly to what was flagged above, capped at 3) ---
  if (couldImprove.some((c) => c.startsWith('Fiber'))) tomorrow.push('Add a vegetable- or fruit-rich meal.')
  if (couldImprove.some((c) => c.startsWith('Sugar'))) tomorrow.push('Swap one sugary drink for water or a zero-calorie option.')
  if (couldImprove.some((c) => c.startsWith('Water'))) tomorrow.push('Log water intake, or keep a bottle nearby as a reminder.')
  if (couldImprove.some((c) => c.startsWith('Sleep'))) tomorrow.push('Aim for an earlier bedtime tonight.')
  if (activity.includes('No exercise logged for this day.')) tomorrow.push('Consider a short walk or mobility session.')

  return {
    localDate,
    food: food.slice(0, 6),
    activity: activity.slice(0, 4),
    lifestyle: lifestyle.slice(0, 6),
    wentWell: wentWell.slice(0, 3),
    couldImprove: couldImprove.slice(0, 3),
    tomorrow: tomorrow.slice(0, 3),
  }
}
