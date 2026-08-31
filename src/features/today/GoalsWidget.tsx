import { Link } from 'react-router-dom'
import type { Goal } from '../../domain/types'
import type { DailySummary } from '../../services/aggregation'
import { calculateGoalProgress } from '../../services/goalProgress'
import { GOAL_METRIC_LABELS, GOAL_METRIC_UNITS } from '../../domain/goalMeta'
import { Card } from '../../components/ui/Card'
import { formatApprox } from '../../utils/format'

export function GoalsWidget({ goals, summary }: { goals: Goal[]; summary: DailySummary }) {
  const progress = calculateGoalProgress(goals, summary)
  if (progress.length === 0) return null

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--color-ink)]">Goals</h3>
        <Link to="/goals" className="text-xs font-medium text-[var(--color-brand-600)]">
          Edit
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {progress.map((p) => (
          <div key={p.goal.id}>
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <span className="text-[var(--color-ink-soft)]">{GOAL_METRIC_LABELS[p.goal.targetMetric!]}</span>
              <span className="tabular-nums text-[var(--color-ink)]">
                {p.currentValue !== undefined ? formatApprox(p.currentValue, 'approximate') : 'Not logged'} / {p.targetValue} {GOAL_METRIC_UNITS[p.goal.targetMetric!]}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-alt)]">
              <div
                className="h-full rounded-full bg-[var(--color-brand-500)] transition-[width]"
                style={{ width: `${(p.ratio ?? 0) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
