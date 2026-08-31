import { useState } from 'react'
import type { LogEntryOfCategory, CannabisMethod } from '../../../domain/types'
import { TextInput, SelectInput, TextArea } from '../../../components/ui/Field'
import { TimestampField } from '../TimestampField'
import { toDateTimeLocalValue, fromDateTimeLocalValue } from '../../../utils/date'
import { defaultTimestamp, type FormProps } from './formShared'

type CannabisEntry = LogEntryOfCategory<'cannabis'>

export function CannabisForm({ entry, formId, onSubmit }: FormProps<CannabisEntry>) {
  const [when, setWhen] = useState(entry ? toDateTimeLocalValue(entry.timestamp) : toDateTimeLocalValue(defaultTimestamp()))
  const [method, setMethod] = useState<CannabisMethod | ''>(entry?.detail.method ?? '')
  const [amount, setAmount] = useState(entry?.detail.amount ?? '')
  const [notes, setNotes] = useState(entry?.notes ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      category: 'cannabis',
      timestamp: fromDateTimeLocalValue(when),
      title: 'Cannabis',
      notes: notes.trim() || undefined,
      detail: { method: method || undefined, amount: amount.trim() || undefined },
    })
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TimestampField value={when} onChange={setWhen} />
      <SelectInput label="Method (optional)" value={method} onChange={(e) => setMethod(e.target.value as CannabisMethod)}>
        <option value="">Not specified</option>
        <option value="smoking">Smoking</option>
        <option value="vaporizer">Vaporizer</option>
        <option value="edible">Edible</option>
        <option value="other">Other</option>
      </SelectInput>
      <TextInput label="Amount (optional)" id="cannabis-amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. one dose" />
      <TextArea label="Notes" id="cannabis-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
    </form>
  )
}
