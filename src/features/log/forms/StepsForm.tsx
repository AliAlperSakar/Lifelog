import { useState } from 'react'
import type { LogEntryOfCategory } from '../../../domain/types'
import { NumberInput } from '../../../components/ui/Field'
import { TimestampField } from '../TimestampField'
import { toDateTimeLocalValue, fromDateTimeLocalValue } from '../../../utils/date'
import { defaultTimestamp, type FormProps } from './formShared'

type StepsEntry = LogEntryOfCategory<'steps'>

export function StepsForm({ entry, formId, onSubmit }: FormProps<StepsEntry>) {
  const [when, setWhen] = useState(entry ? toDateTimeLocalValue(entry.timestamp) : toDateTimeLocalValue(defaultTimestamp()))
  const [steps, setSteps] = useState(entry?.detail.steps?.toString() ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = Number(steps)
    if (!Number.isFinite(n) || n < 0) return
    onSubmit({ category: 'steps', timestamp: fromDateTimeLocalValue(when), title: 'Steps', detail: { steps: n } })
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TimestampField value={when} onChange={setWhen} />
      <NumberInput
        label="Steps"
        id="steps-count"
        value={steps}
        onChange={(e) => setSteps(e.target.value)}
        min={0}
        step={1}
        placeholder="e.g. 3500"
        hint="Logged incrementally — add another entry later to add more steps to today"
        required
      />
    </form>
  )
}
