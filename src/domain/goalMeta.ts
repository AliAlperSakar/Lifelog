import type { GoalMetric, GoalType } from './types'

export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  maintain_weight: 'Maintain weight',
  lose_weight: 'Lose weight',
  gain_weight: 'Gain weight',
  improve_protein: 'Improve protein intake',
  improve_hydration: 'Improve hydration',
  run_consistently: 'Run consistently',
  improve_knee_leg_strength: 'Improve knee/leg strength',
  improve_sleep: 'Improve sleep',
  reduce_nicotine: 'Reduce nicotine',
  reduce_alcohol: 'Reduce alcohol',
  improve_diet_quality: 'Improve dietary quality',
}

export const GOAL_METRIC_LABELS: Record<GoalMetric, string> = {
  calories: 'Calories',
  protein: 'Protein',
  fiber: 'Fiber',
  water: 'Water',
  sleep: 'Sleep',
  steps: 'Steps',
  running_distance: 'Running distance',
  weight: 'Weight',
}

export const GOAL_METRIC_UNITS: Record<GoalMetric, string> = {
  calories: 'kcal',
  protein: 'g',
  fiber: 'g',
  water: 'ml',
  sleep: 'min',
  steps: 'steps',
  running_distance: 'km',
  weight: 'kg',
}

/** A reasonable default metric/target suggested when the user picks a goal
 * type — always editable, never required. */
export const GOAL_TYPE_DEFAULT_METRIC: Partial<Record<GoalType, { metric: GoalMetric; value: number }>> = {
  improve_protein: { metric: 'protein', value: 130 },
  improve_hydration: { metric: 'water', value: 2500 },
  improve_sleep: { metric: 'sleep', value: 480 },
  run_consistently: { metric: 'running_distance', value: 5 },
  maintain_weight: { metric: 'weight', value: 95 },
  lose_weight: { metric: 'weight', value: 90 },
  gain_weight: { metric: 'weight', value: 100 },
}
