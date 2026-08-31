import { useState } from 'react'
import type { LogEntryOfCategory } from '../../../domain/types'
import { NumberInput } from '../../../components/ui/Field'
import { TimestampField } from '../TimestampField'
import { toDateTimeLocalValue, fromDateTimeLocalValue } from '../../../utils/date'
import { defaultTimestamp, type FormProps } from './formShared'
import clsx from 'clsx'

type WaterEntry = LogEntryOfCategory<'water'>

const QUICK_AMOUNTS = [250, 330, 500, 750, 1000]

export function WaterForm({ entry, formId, onSubmit }: FormProps<WaterEntry>) {
  const [when, setWhen] = useState(entry ? toDateTimeLocalValue(entry.timestamp) : toDateTimeLocalValue(defaultTimestamp()))
  const [amount, setAmount] = useState(entry?.detail.volumeMl ?? 250)
  const [custom, setCustom] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const volumeMl = custom.trim() !== '' ? Number(custom) : amount
    if (!Number.isFinite(volumeMl) || volumeMl <= 0) return
    onSubmit({
      category: 'water',
      timestamp: fromDateTimeLocalValue(when),
      title: 'Water',
      detail: { volumeMl },
    })
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TimestampField value={when} onChange={setWhen} />
      <div>
        <span className="mb-2 block text-sm font-medium text-[var(--color-ink-soft)]">Amount</span>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_AMOUNTS.map((ml) => (
            <button
              key={ml}
              type="button"
              onClick={() => {
                setAmount(ml)
                setCustom('')
              }}
              className={clsx(
                'tap-target rounded-[var(--radius-control)] border px-3 py-3 text-sm font-medium transition-colors',
                amount === ml && custom === ''
                  ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)]'
                  : 'border-[var(--color-border)] text-[var(--color-ink)] hover:bg-[var(--color-surface-alt)]',
              )}
            >
              +{ml >= 1000 ? `${ml / 1000} L` : `${ml} ml`}
            </button>
          ))}
          <NumberInput
            label=""
            id="water-custom"
            placeholder="Custom ml"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            step="any"
            min={0}
            className="col-span-1"
          />
        </div>
      </div>
    </form>
  )
}
