import { useState } from 'react'
import type { LogEntryOfCategory, NicotineSubtype } from '../../../domain/types'
import { NumberInput, SelectInput, TextArea } from '../../../components/ui/Field'
import { TimestampField } from '../TimestampField'
import { toDateTimeLocalValue, fromDateTimeLocalValue } from '../../../utils/date'
import { NICOTINE_LABELS } from '../../../domain/categoryMeta'
import { parseOptionalNumber, defaultTimestamp, type FormProps } from './formShared'

type NicotineEntry = LogEntryOfCategory<'nicotine'>

export function NicotineForm({ entry, formId, onSubmit }: FormProps<NicotineEntry>) {
  const [when, setWhen] = useState(entry ? toDateTimeLocalValue(entry.timestamp) : toDateTimeLocalValue(defaultTimestamp()))
  const [subtype, setSubtype] = useState<NicotineSubtype>(entry?.subtype ?? 'cigarette')
  const [count, setCount] = useState(entry?.detail.count?.toString() ?? '1')
  const [amountMg, setAmountMg] = useState(entry?.detail.amountMg?.toString() ?? '')
  const [notes, setNotes] = useState(entry?.notes ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      category: 'nicotine',
      subtype,
      timestamp: fromDateTimeLocalValue(when),
      title: NICOTINE_LABELS[subtype],
      notes: notes.trim() || undefined,
      detail: { count: parseOptionalNumber(count), amountMg: parseOptionalNumber(amountMg) },
    })
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <SelectInput label="Type" value={subtype} onChange={(e) => setSubtype(e.target.value as NicotineSubtype)}>
          {(Object.keys(NICOTINE_LABELS) as NicotineSubtype[]).map((s) => (
            <option key={s} value={s}>
              {NICOTINE_LABELS[s]}
            </option>
          ))}
        </SelectInput>
        <TimestampField value={when} onChange={setWhen} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <NumberInput label="Count" id="nic-count" value={count} onChange={(e) => setCount(e.target.value)} min={0} step={1} />
        <NumberInput label="Nicotine (mg, optional)" id="nic-mg" value={amountMg} onChange={(e) => setAmountMg(e.target.value)} min={0} step="any" />
      </div>
      <TextArea label="Notes" id="nic-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
    </form>
  )
}
