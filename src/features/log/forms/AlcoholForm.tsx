import { useState } from 'react'
import type { LogEntryOfCategory } from '../../../domain/types'
import { NumberInput, TextInput, TextArea } from '../../../components/ui/Field'
import { TimestampField } from '../TimestampField'
import { toDateTimeLocalValue, fromDateTimeLocalValue } from '../../../utils/date'
import { parseOptionalNumber, defaultTimestamp, type FormProps } from './formShared'

type AlcoholEntry = LogEntryOfCategory<'alcohol'>

export function AlcoholForm({ entry, formId, onSubmit }: FormProps<AlcoholEntry>) {
  const [when, setWhen] = useState(entry ? toDateTimeLocalValue(entry.timestamp) : toDateTimeLocalValue(defaultTimestamp()))
  const [beverage, setBeverage] = useState(entry?.detail.beverage ?? '')
  const [volumeMl, setVolumeMl] = useState(entry?.detail.volumeMl?.toString() ?? '')
  const [abvPercent, setAbvPercent] = useState(entry?.detail.abvPercent?.toString() ?? '')
  const [notes, setNotes] = useState(entry?.notes ?? '')

  const vol = parseOptionalNumber(volumeMl)
  const abv = parseOptionalNumber(abvPercent)
  // Standard drink unit ≈ 10g pure alcohol ≈ volume(ml) × abv% × 0.789 / 1000 / 10
  const units = vol !== undefined && abv !== undefined ? (vol * (abv / 100) * 0.789) / 10 : undefined

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      category: 'alcohol',
      timestamp: fromDateTimeLocalValue(when),
      title: beverage.trim() || 'Alcohol',
      notes: notes.trim() || undefined,
      detail: { beverage: beverage.trim() || undefined, volumeMl: vol, abvPercent: abv, units },
    })
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TimestampField value={when} onChange={setWhen} />
      <TextInput label="Beverage" id="alc-name" value={beverage} onChange={(e) => setBeverage(e.target.value)} placeholder="e.g. Red wine" />
      <div className="grid grid-cols-2 gap-3">
        <NumberInput label="Volume (ml)" id="alc-vol" value={volumeMl} onChange={(e) => setVolumeMl(e.target.value)} min={0} step="any" />
        <NumberInput label="ABV (%)" id="alc-abv" value={abvPercent} onChange={(e) => setAbvPercent(e.target.value)} min={0} step="any" />
      </div>
      {units !== undefined && <p className="text-sm text-[var(--color-ink-soft)]">≈ {units.toFixed(1)} standard units</p>}
      <TextArea label="Notes" id="alc-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
    </form>
  )
}
