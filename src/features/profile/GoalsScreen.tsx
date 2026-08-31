import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useGoals } from '../../hooks/useProfile'
import { goalRepository } from '../../repositories/goalRepository'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SelectInput, NumberInput } from '../../components/ui/Field'
import { IconButton } from '../../components/ui/IconButton'
import { GOAL_METRIC_LABELS, GOAL_METRIC_UNITS, GOAL_TYPE_DEFAULT_METRIC, GOAL_TYPE_LABELS } from '../../domain/goalMeta'
import type { GoalMetric, GoalType } from '../../domain/types'

const GOAL_TYPES = Object.keys(GOAL_TYPE_LABELS) as GoalType[]
const GOAL_METRICS = Object.keys(GOAL_METRIC_LABELS) as GoalMetric[]

export function GoalsScreen() {
  const goals = useGoals()
  const [adding, setAdding] = useState(false)
  const [type, setType] = useState<GoalType>('improve_protein')
  const [metric, setMetric] = useState<GoalMetric | ''>('protein')
  const [targetValue, setTargetValue] = useState('130')

  function handleTypeChange(t: GoalType) {
    setType(t)
    const def = GOAL_TYPE_DEFAULT_METRIC[t]
    setMetric(def?.metric ?? '')
    setTargetValue(def ? def.value.toString() : '')
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    await goalRepository.create({
      type,
      active: true,
      targetMetric: metric || undefined,
      targetValue: metric && targetValue ? Number(targetValue) : undefined,
    })
    setAdding(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Link to="/profile" className="tap-target -ml-1 text-[var(--color-ink-soft)]">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-semibold text-[var(--color-ink)]">Goals</h1>
      </header>

      <p className="text-sm text-[var(--color-ink-soft)]">
        All optional. Missing a day doesn’t reset anything — goals just show where things stand.
      </p>

      <div className="flex flex-col gap-3">
        {goals?.length === 0 && !adding && <p className="text-sm text-[var(--color-ink-faint)]">No goals yet.</p>}
        {goals?.map((goal) => (
          <Card key={goal.id} className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-[var(--color-ink)]">{GOAL_TYPE_LABELS[goal.type]}</p>
              {goal.targetMetric && goal.targetValue !== undefined && (
                <p className="text-sm text-[var(--color-ink-soft)]">
                  Target: {goal.targetValue} {GOAL_METRIC_UNITS[goal.targetMetric]} {GOAL_METRIC_LABELS[goal.targetMetric].toLowerCase()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-[var(--color-ink-soft)]">
                <input type="checkbox" checked={goal.active} onChange={(e) => void goalRepository.update(goal.id, { active: e.target.checked })} />
                Active
              </label>
              <IconButton aria-label="Delete goal" onClick={() => void goalRepository.remove(goal.id)}>
                <Trash2 size={16} />
              </IconButton>
            </div>
          </Card>
        ))}
      </div>

      {adding ? (
        <Card>
          <form onSubmit={(e) => void handleAdd(e)} className="flex flex-col gap-4">
            <SelectInput label="Goal" value={type} onChange={(e) => handleTypeChange(e.target.value as GoalType)}>
              {GOAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {GOAL_TYPE_LABELS[t]}
                </option>
              ))}
            </SelectInput>
            <div className="grid grid-cols-2 gap-3">
              <SelectInput label="Track against (optional)" value={metric} onChange={(e) => setMetric(e.target.value as GoalMetric)}>
                <option value="">No numeric target</option>
                {GOAL_METRICS.map((m) => (
                  <option key={m} value={m}>
                    {GOAL_METRIC_LABELS[m]}
                  </option>
                ))}
              </SelectInput>
              {metric && (
                <NumberInput
                  label={`Target (${GOAL_METRIC_UNITS[metric]})`}
                  id="goal-target"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  min={0}
                  step="any"
                />
              )}
            </div>
            <div className="flex gap-2">
              <Button type="submit">Add goal</Button>
              <Button type="button" variant="secondary" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Button variant="secondary" onClick={() => setAdding(true)} className="w-fit">
          <Plus size={16} /> Add goal
        </Button>
      )}
    </div>
  )
}
