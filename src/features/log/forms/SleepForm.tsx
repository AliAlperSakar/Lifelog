import { useState } from 'react'
import type { LogEntryOfCategory, SleepQuality } from '../../../domain/types'
import { SLEEP_QUALITY_LABELS } from '../../../domain/types'
import { TextInput, TextArea } from '../../../components/ui/Field'
import { toDateTimeLocalValue, fromDateTimeLocalValue, minutesBetween } from '../../../utils/date'
import { defaultTimestamp, type FormProps } from './formShared'
import clsx from 'clsx'

type SleepEntry = LogEntryOfCategory<'sleep'>

export function SleepForm({ entry, formId, onSubmit }: FormProps<SleepEntry>) {
  const [bedTime, setBedTime] = useState(entry?.detail.bedTime ? toDateTimeLocalValue(entry.detail.bedTime) : '')
  const [wakeTime, setWakeTime] = useState(entry?.detail.wakeTime ? toDateTimeLocalValue(entry.detail.wakeTime) : toDateTimeLocalValue(defaultTimestamp()))
  const [reportedText, setReportedText] = useState(entry?.detail.reportedDurationText ?? '')
  const [quality, setQuality] = useState<SleepQuality | undefined>(entry?.detail.quality)
  const [notes, setNotes] = useState(entry?.notes ?? '')

  function parseReportedMinutes(text: string): number | undefined {
    // Accepts "7-8", "7 to 8", "7.5" (hours) and turns it into a midpoint in
    // minutes while keeping the original text as the thing we actually show.
    const rangeMatch = /(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)/.exec(text)
    if (rangeMatch) return ((Number(rangeMatch[1]) + Number(rangeMatch[2])) / 2) * 60
    const singleMatch = /(\d+(?:\.\d+)?)/.exec(text)
    if (singleMatch) return Number(singleMatch[1]) * 60
    return undefined
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const bedIso = bedTime ? fromDateTimeLocalValue(bedTime) : undefined
    const wakeIso = wakeTime ? fromDateTimeLocalValue(wakeTime) : undefined
    const reportedDurationMin = reportedText.trim() ? parseReportedMinutes(reportedText) : undefined
    onSubmit({
      category: 'sleep',
      timestamp: wakeIso ?? bedIso ?? defaultTimestamp(),
      title: 'Sleep',
      notes: notes.trim() || undefined,
      detail: {
        bedTime: bedIso,
        wakeTime: wakeIso,
        reportedDurationMin,
        reportedDurationText: reportedText.trim() || undefined,
        quality,
      },
    })
  }

  const calculated = bedTime && wakeTime ? minutesBetween(fromDateTimeLocalValue(bedTime), fromDateTimeLocalValue(wakeTime)) : undefined

  return (
    <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sleep-bed" className="text-sm font-medium text-[var(--color-ink-soft)]">
            Bedtime
          </label>
          <input
            id="sleep-bed"
            type="datetime-local"
            value={bedTime}
            onChange={(e) => setBedTime(e.target.value)}
            className="tap-target w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-[16px] outline-none focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/40"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sleep-wake" className="text-sm font-medium text-[var(--color-ink-soft)]">
            Wake time
          </label>
          <input
            id="sleep-wake"
            type="datetime-local"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
            className="tap-target w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-[16px] outline-none focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/40"
          />
        </div>
      </div>
      {calculated !== undefined && <p className="text-sm text-[var(--color-ink-soft)]">Calculated: ~{Math.floor(calculated / 60)}h {calculated % 60}m</p>}

      <TextInput
        label="Or just describe it"
        id="sleep-reported"
        value={reportedText}
        onChange={(e) => setReportedText(e.target.value)}
        placeholder='e.g. "about 7-8 hours"'
        hint="Preserved as you wrote it rather than forced into an exact number"
      />

      <div>
        <span className="mb-2 block text-sm font-medium text-[var(--color-ink-soft)]">Quality</span>
        <div className="flex gap-2">
          {([1, 2, 3, 4, 5] as SleepQuality[]).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQuality(q)}
              title={SLEEP_QUALITY_LABELS[q]}
              className={clsx(
                'tap-target flex-1 rounded-[var(--radius-control)] border py-2.5 text-sm font-medium transition-colors',
                quality === q ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)]' : 'border-[var(--color-border)] text-[var(--color-ink-soft)]',
              )}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <TextArea label="Notes" id="sleep-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
    </form>
  )
}
