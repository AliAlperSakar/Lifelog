import type { Goal, GoalMetric } from '../domain/types'
import type { DailySummary } from './aggregation'

export interface GoalProgress {
  goal: Goal
  currentValue?: number
  targetValue: number
  ratio?: number
}

function metricCurrentValue(metric: GoalMetric, summary: DailySummary): number | undefined {
  switch (metric) {
    case 'calories':
      return summary.nutrition.calories?.value
    case 'protein':
      return summary.nutrition.proteinG?.value
    case 'fiber':
      return summary.nutrition.fiberG?.value
    case 'water':
      return summary.fluids?.value ?? summary.water?.value
    case 'sleep':
      return summary.sleep?.minutes
    case 'steps':
      return summary.steps?.value
    case 'running_distance':
      return summary.running.distanceKm?.value
    case 'weight':
      return summary.weight?.detail.weightKg
    default:
      return undefined
  }
}

/** Calm, non-judgmental progress — a ratio for a progress bar, nothing that
 * flags "missed" or uses alert colors. A single unlogged day is never
 * treated as failure (spec §43). */
export function calculateGoalProgress(goals: Goal[], summary: DailySummary): GoalProgress[] {
  return goals
    .filter((g) => g.active && g.targetMetric && g.targetValue !== undefined)
    .map((goal) => {
      const currentValue = metricCurrentValue(goal.targetMetric!, summary)
      const targetValue = goal.targetValue!
      return {
        goal,
        currentValue,
        targetValue,
        ratio: currentValue !== undefined && targetValue > 0 ? Math.min(currentValue / targetValue, 1) : undefined,
      }
    })
}
