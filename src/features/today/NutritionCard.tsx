import type { DailyNutrition } from '../../services/aggregation'
import { formatApprox } from '../../utils/format'
import { Card } from '../../components/ui/Card'

interface NutritionCardProps {
  nutrition: DailyNutrition
}

function Macro({ label, value, approximate }: { label: string; value: number; approximate: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-[var(--color-ink-faint)]">{label}</span>
      <span className="text-[15px] font-semibold tabular-nums text-[var(--color-ink)]">{formatApprox(value, approximate ? 'approximate' : 'exact')} g</span>
    </div>
  )
}

export function NutritionCard({ nutrition }: NutritionCardProps) {
  if (!nutrition.calories) {
    return (
      <Card>
        <p className="text-sm text-[var(--color-ink-soft)]">No food or drinks logged yet today.</p>
      </Card>
    )
  }

  const macros: { label: string; agg: typeof nutrition.proteinG }[] = [
    { label: 'Protein', agg: nutrition.proteinG },
    { label: 'Carbs', agg: nutrition.carbsG },
    { label: 'Fat', agg: nutrition.fatG },
    { label: 'Fiber', agg: nutrition.fiberG },
    { label: 'Sugar', agg: nutrition.sugarG },
  ]
  const shown = macros.filter((m) => m.agg !== undefined)

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <span className="text-3xl font-semibold tabular-nums text-[var(--color-ink)]">
          {formatApprox(nutrition.calories.value, nutrition.calories.approximate ? 'approximate' : 'exact')}
        </span>{' '}
        <span className="text-base font-medium text-[var(--color-ink-soft)]">kcal</span>
      </div>
      {shown.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {shown.map((m) => (
            <Macro key={m.label} label={m.label} value={m.agg!.value} approximate={m.agg!.approximate} />
          ))}
        </div>
      )}
    </Card>
  )
}
