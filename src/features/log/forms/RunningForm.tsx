import { useState } from 'react'
import type { LogEntryOfCategory } from '../../../domain/types'
import { NumberInput, TextArea } from '../../../components/ui/Field'
import { TimestampField } from '../TimestampField'
import { toDateTimeLocalValue, fromDateTimeLocalValue } from '../../../utils/date'
import { parseOptionalNumber, defaultTimestamp, type FormProps } from './formShared'

type RunningEntry = LogEntryOfCategory<'running'>

export function RunningForm({ entry, formId, onSubmit }: FormProps<RunningEntry>) {
  const [when, setWhen] = useState(entry ? toDateTimeLocalValue(entry.timestamp) : toDateTimeLocalValue(defaultTimestamp()))
  const [distanceKm, setDistanceKm] = useState(entry?.detail.distanceKm?.toString() ?? '')
  const [durationMin, setDurationMin] = useState(entry?.detail.durationMin?.toString() ?? '')
  const [estimatedKcal, setEstimatedKcal] = useState(entry?.detail.estimatedKcal?.toString() ?? '')
  const [notes, setNotes] = useState(entry?.notes ?? '')

  const dist = Number(distanceKm)
  const dur = Number(durationMin)
  const pace = dist > 0 && dur > 0 ? dur / dist : undefined

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      category: 'running',
      timestamp: fromDateTimeLocalValue(when),
      title: 'Running',
      notes: notes.trim() || undefined,
      detail: {
        distanceKm: parseOptionalNumber(distanceKm),
        durationMin: parseOptionalNumber(durationMin),
        estimatedKcal: parseOptionalNumber(estimatedKcal),
      },
    })
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TimestampField value={when} onChange={setWhen} />
      <div className="grid grid-cols-2 gap-3">
        <NumberInput label="Distance (km)" id="run-dist" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} step="any" min={0} />
        <NumberInput label="Duration (min)" id="run-dur" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} step="any" min={0} />
      </div>
      {pace !== undefined && (
        <p className="text-sm text-[var(--color-ink-soft)]">
          Pace: ~{Math.floor(pace)}:{Math.round((pace - Math.floor(pace)) * 60)
            .toString()
            .padStart(2, '0')}{' '}
          /km
        </p>
      )}
      <NumberInput
        label="Estimated calories"
        id="run-kcal"
        value={estimatedKcal}
        onChange={(e) => setEstimatedKcal(e.target.value)}
        step="any"
        min={0}
      />
      <TextArea label="Notes" id="run-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Route, how it felt…" />
    </form>
  )
}
