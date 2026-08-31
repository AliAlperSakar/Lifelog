import { useState } from 'react'
import type { LogEntryOfCategory, SymptomSubtype } from '../../../domain/types'
import { SelectInput, NumberInput, TextArea } from '../../../components/ui/Field'
import { TimestampField } from '../TimestampField'
import { toDateTimeLocalValue, fromDateTimeLocalValue } from '../../../utils/date'
import { SYMPTOM_LABELS } from '../../../domain/categoryMeta'
import { parseOptionalNumber, defaultTimestamp, type FormProps } from './formShared'
import clsx from 'clsx'

type SymptomEntry = LogEntryOfCategory<'symptom'>

export function SymptomForm({ entry, formId, onSubmit }: FormProps<SymptomEntry>) {
  const [when, setWhen] = useState(entry ? toDateTimeLocalValue(entry.timestamp) : toDateTimeLocalValue(defaultTimestamp()))
  const [subtype, setSubtype] = useState<SymptomSubtype>(entry?.subtype ?? 'headache')
  const [severity, setSeverity] = useState<1 | 2 | 3 | 4 | 5 | undefined>(entry?.detail.severity)
  const [durationMin, setDurationMin] = useState(entry?.detail.durationMin?.toString() ?? '')
  const [notes, setNotes] = useState(entry?.notes ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      category: 'symptom',
      subtype,
      timestamp: fromDateTimeLocalValue(when),
      title: SYMPTOM_LABELS[subtype],
      notes: notes.trim() || undefined,
      detail: { severity, durationMin: parseOptionalNumber(durationMin) },
    })
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-xs text-[var(--color-ink-faint)]">Self-reported only — not a diagnosis.</p>
      <div className="grid grid-cols-2 gap-3">
        <SelectInput label="Symptom" value={subtype} onChange={(e) => setSubtype(e.target.value as SymptomSubtype)}>
          {(Object.keys(SYMPTOM_LABELS) as SymptomSubtype[]).map((s) => (
            <option key={s} value={s}>
              {SYMPTOM_LABELS[s]}
            </option>
          ))}
        </SelectInput>
        <TimestampField value={when} onChange={setWhen} />
      </div>
      <div>
        <span className="mb-2 block text-sm font-medium text-[var(--color-ink-soft)]">Severity (optional)</span>
        <div className="flex gap-2">
          {([1, 2, 3, 4, 5] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSeverity(severity === s ? undefined : s)}
              className={clsx(
                'tap-target flex-1 rounded-[var(--radius-control)] border py-2.5 text-sm font-medium transition-colors',
                severity === s ? 'border-[var(--color-alert)] bg-[var(--color-alert)]/10 text-[var(--color-alert)]' : 'border-[var(--color-border)] text-[var(--color-ink-soft)]',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <NumberInput label="Duration (min, optional)" id="sym-dur" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} min={0} step="any" />
      <TextArea label="Notes" id="sym-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
    </form>
  )
}
