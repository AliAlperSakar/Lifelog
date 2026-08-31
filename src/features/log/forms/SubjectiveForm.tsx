import { useState } from 'react'
import type { LogEntryOfCategory, SubjectiveSubtype } from '../../../domain/types'
import { APPETITE_LABELS } from '../../../domain/types'
import { SUBJECTIVE_LABELS } from '../../../domain/categoryMeta'
import { TextArea } from '../../../components/ui/Field'
import { TimestampField } from '../TimestampField'
import { toDateTimeLocalValue, fromDateTimeLocalValue } from '../../../utils/date'
import { defaultTimestamp, type FormProps } from './formShared'
import clsx from 'clsx'

type SubjectiveEntry = LogEntryOfCategory<'subjective'>

export function SubjectiveForm({ entry, defaultSubtype, formId, onSubmit }: FormProps<SubjectiveEntry>) {
  const [when, setWhen] = useState(entry ? toDateTimeLocalValue(entry.timestamp) : toDateTimeLocalValue(defaultTimestamp()))
  const subtype = (entry?.subtype ?? (defaultSubtype as SubjectiveSubtype) ?? 'mood') as SubjectiveSubtype
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(entry?.detail.rating ?? 3)
  const [notes, setNotes] = useState(entry?.notes ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      category: 'subjective',
      subtype,
      timestamp: fromDateTimeLocalValue(when),
      title: SUBJECTIVE_LABELS[subtype],
      notes: notes.trim() || undefined,
      detail: { rating },
    })
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-5">
      <TimestampField value={when} onChange={setWhen} />
      <div>
        <span className="mb-2 block text-sm font-medium text-[var(--color-ink-soft)]">{SUBJECTIVE_LABELS[subtype]}</span>
        <div className="flex gap-2">
          {([1, 2, 3, 4, 5] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRating(r)}
              className={clsx(
                'tap-target flex-1 rounded-[var(--radius-control)] border py-3 text-center text-sm font-medium transition-colors',
                rating === r ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)]' : 'border-[var(--color-border)] text-[var(--color-ink-soft)]',
              )}
            >
              <span className="block text-base">{r}</span>
              {subtype === 'appetite' && <span className="mt-0.5 block text-[10px] leading-tight">{APPETITE_LABELS[r]}</span>}
            </button>
          ))}
        </div>
      </div>
      <TextArea label="Notes" id="subj-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
    </form>
  )
}
