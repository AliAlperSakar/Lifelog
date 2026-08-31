import { useState } from 'react'
import type { LogEntryOfCategory, DrinkSubtype } from '../../../domain/types'
import { TextInput, NumberInput, SelectInput, TextArea } from '../../../components/ui/Field'
import { TimestampField } from '../TimestampField'
import { ProvenanceFields, DEFAULT_PROVENANCE, type ProvenanceValue } from '../ProvenanceFields'
import { toDateTimeLocalValue, fromDateTimeLocalValue } from '../../../utils/date'
import { parseOptionalNumber, defaultTimestamp, type FormProps } from './formShared'

type DrinkEntry = LogEntryOfCategory<'drink'>

const SUBTYPE_LABELS: Record<DrinkSubtype, string> = {
  coffee: 'Coffee',
  tea: 'Tea',
  soda: 'Soda / cola',
  energy_drink: 'Energy drink',
  juice: 'Juice',
  milk: 'Milk',
  other: 'Other',
}

export function DrinkForm({ entry, defaultSubtype, formId, onSubmit }: FormProps<DrinkEntry>) {
  const [when, setWhen] = useState(entry ? toDateTimeLocalValue(entry.timestamp) : toDateTimeLocalValue(defaultTimestamp()))
  const [subtype, setSubtype] = useState<DrinkSubtype>(entry?.subtype ?? (defaultSubtype as DrinkSubtype) ?? 'coffee')
  const [title, setTitle] = useState(entry?.title ?? '')
  const [volumeMl, setVolumeMl] = useState(entry?.detail.volumeMl?.toString() ?? '')
  const [calories, setCalories] = useState(entry?.detail.calories?.toString() ?? '')
  const [sugarG, setSugarG] = useState(entry?.detail.sugarG?.toString() ?? '')
  const [caffeineMg, setCaffeineMg] = useState(entry?.detail.caffeineMg?.toString() ?? '')
  const [notes, setNotes] = useState(entry?.notes ?? '')
  const [provenance, setProvenance] = useState<ProvenanceValue>(
    entry ? { source: entry.source, measurementStatus: entry.measurementStatus, confidence: entry.confidence } : DEFAULT_PROVENANCE,
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      category: 'drink',
      subtype,
      timestamp: fromDateTimeLocalValue(when),
      title: title.trim() || SUBTYPE_LABELS[subtype],
      notes: notes.trim() || undefined,
      detail: {
        volumeMl: parseOptionalNumber(volumeMl),
        calories: parseOptionalNumber(calories),
        sugarG: parseOptionalNumber(sugarG),
        caffeineMg: parseOptionalNumber(caffeineMg),
      },
      ...provenance,
    })
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <SelectInput label="Type" value={subtype} onChange={(e) => setSubtype(e.target.value as DrinkSubtype)}>
          {(Object.keys(SUBTYPE_LABELS) as DrinkSubtype[]).map((s) => (
            <option key={s} value={s}>
              {SUBTYPE_LABELS[s]}
            </option>
          ))}
        </SelectInput>
        <TimestampField value={when} onChange={setWhen} />
      </div>
      <TextInput label="Name (optional)" id="drink-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Earl Grey" />
      <div className="grid grid-cols-2 gap-3">
        <NumberInput label="Volume (ml)" id="drink-vol" value={volumeMl} onChange={(e) => setVolumeMl(e.target.value)} step="any" min={0} />
        <NumberInput label="Calories" id="drink-cal" value={calories} onChange={(e) => setCalories(e.target.value)} step="any" min={0} />
        <NumberInput label="Sugar (g)" id="drink-sugar" value={sugarG} onChange={(e) => setSugarG(e.target.value)} step="any" min={0} />
        <NumberInput
          label="Caffeine (mg)"
          id="drink-caffeine"
          value={caffeineMg}
          onChange={(e) => setCaffeineMg(e.target.value)}
          step="any"
          min={0}
          hint="Leave blank if unknown — won't count as 0"
        />
      </div>
      <TextArea label="Notes" id="drink-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <ProvenanceFields value={provenance} onChange={setProvenance} />
    </form>
  )
}
