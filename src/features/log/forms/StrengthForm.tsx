import { useState } from 'react'
import type { LogEntryOfCategory, StrengthExercise, StrengthFocus } from '../../../domain/types'
import { STRENGTH_EXERCISE_PRESETS } from '../../../domain/types'
import { NumberInput, SelectInput, TextArea } from '../../../components/ui/Field'
import { TimestampField } from '../TimestampField'
import { toDateTimeLocalValue, fromDateTimeLocalValue } from '../../../utils/date'
import { parseOptionalNumber, defaultTimestamp, type FormProps } from './formShared'
import { X } from 'lucide-react'

type StrengthEntryT = LogEntryOfCategory<'strength'>

export function StrengthForm({ entry, formId, onSubmit }: FormProps<StrengthEntryT>) {
  const [when, setWhen] = useState(entry ? toDateTimeLocalValue(entry.timestamp) : toDateTimeLocalValue(defaultTimestamp()))
  const [focus, setFocus] = useState<StrengthFocus>(entry?.detail.focus ?? 'legs_knee')
  const [durationMin, setDurationMin] = useState(entry?.detail.durationMin?.toString() ?? '')
  const [exercises, setExercises] = useState<StrengthExercise[]>(entry?.detail.exercises ?? [])
  const [notes, setNotes] = useState(entry?.notes ?? '')

  function addExercise(name: string) {
    if (exercises.some((ex) => ex.name === name)) return
    setExercises([...exercises, { name }])
  }

  function updateExercise(idx: number, changes: Partial<StrengthExercise>) {
    setExercises(exercises.map((ex, i) => (i === idx ? { ...ex, ...changes } : ex)))
  }

  function removeExercise(idx: number) {
    setExercises(exercises.filter((_, i) => i !== idx))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      category: 'strength',
      timestamp: fromDateTimeLocalValue(when),
      title: focus === 'legs_knee' ? 'Leg/knee training' : 'Strength training',
      notes: notes.trim() || undefined,
      detail: {
        focus,
        durationMin: parseOptionalNumber(durationMin),
        exercises: exercises.length > 0 ? exercises : undefined,
      },
    })
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <SelectInput label="Focus" value={focus} onChange={(e) => setFocus(e.target.value as StrengthFocus)}>
          <option value="legs_knee">Legs / knee support</option>
          <option value="general">General strength</option>
        </SelectInput>
        <TimestampField value={when} onChange={setWhen} />
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium text-[var(--color-ink-soft)]">Exercises</span>
        <div className="mb-2 flex flex-wrap gap-2">
          {STRENGTH_EXERCISE_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => addExercise(preset)}
              className="tap-target rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink-soft)] hover:bg-[var(--color-brand-50)] hover:text-[var(--color-brand-700)]"
            >
              + {preset}
            </button>
          ))}
        </div>

        {exercises.length > 0 && (
          <div className="flex flex-col gap-2">
            {exercises.map((ex, idx) => (
              <div key={`${ex.name}-${idx}`} className="flex items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border)] p-2">
                <span className="flex-1 truncate text-sm font-medium text-[var(--color-ink)]">{ex.name}</span>
                <input
                  aria-label={`${ex.name} sets`}
                  type="number"
                  min={0}
                  placeholder="sets"
                  value={ex.sets ?? ''}
                  onChange={(e) => updateExercise(idx, { sets: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-14 rounded border border-[var(--color-border)] px-1.5 py-1 text-sm"
                />
                <input
                  aria-label={`${ex.name} reps`}
                  type="number"
                  min={0}
                  placeholder="reps"
                  value={ex.reps ?? ''}
                  onChange={(e) => updateExercise(idx, { reps: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-14 rounded border border-[var(--color-border)] px-1.5 py-1 text-sm"
                />
                <input
                  aria-label={`${ex.name} weight`}
                  type="number"
                  min={0}
                  placeholder="kg"
                  value={ex.weightKg ?? ''}
                  onChange={(e) => updateExercise(idx, { weightKg: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-14 rounded border border-[var(--color-border)] px-1.5 py-1 text-sm"
                />
                <button type="button" onClick={() => removeExercise(idx)} aria-label={`Remove ${ex.name}`} className="tap-target text-[var(--color-ink-faint)]">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <NumberInput label="Total duration (min)" id="str-dur" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} step="any" min={0} />
      <TextArea label="Notes" id="str-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
    </form>
  )
}
