import { useState } from 'react'
import type { LogEntryOfCategory } from '../../../domain/types'
import { NumberInput, TextArea } from '../../../components/ui/Field'
import { TimestampField } from '../TimestampField'
import { ProvenanceFields, DEFAULT_PROVENANCE, type ProvenanceValue } from '../ProvenanceFields'
import { toDateTimeLocalValue, fromDateTimeLocalValue } from '../../../utils/date'
import { defaultTimestamp, type FormProps } from './formShared'

type WeightEntry = LogEntryOfCategory<'weight'>

export function WeightForm({ entry, formId, onSubmit }: FormProps<WeightEntry>) {
  const [when, setWhen] = useState(entry ? toDateTimeLocalValue(entry.timestamp) : toDateTimeLocalValue(defaultTimestamp()))
  const [weightKg, setWeightKg] = useState(entry?.detail.weightKg?.toString() ?? '')
  const [notes, setNotes] = useState(entry?.notes ?? '')
  const [provenance, setProvenance] = useState<ProvenanceValue>(
    entry?.source && entry.measurementStatus && entry.confidence
      ? { source: entry.source, measurementStatus: entry.measurementStatus, confidence: entry.confidence }
      : DEFAULT_PROVENANCE,
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = Number(weightKg)
    if (!Number.isFinite(n) || n <= 0) return
    onSubmit({
      category: 'weight',
      timestamp: fromDateTimeLocalValue(when),
      title: 'Body weight',
      notes: notes.trim() || undefined,
      detail: { weightKg: n },
      ...provenance,
    })
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TimestampField value={when} onChange={setWhen} />
      <NumberInput label="Weight (kg)" id="weight-kg" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} min={0} step="any" required />
      <TextArea label="Notes" id="weight-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <ProvenanceFields value={provenance} onChange={setProvenance} />
    </form>
  )
}
