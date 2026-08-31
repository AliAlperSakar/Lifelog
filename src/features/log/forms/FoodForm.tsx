import { useState } from 'react'
import type { LogEntryOfCategory, FoodSubtype } from '../../../domain/types'
import { TextInput, NumberInput, SelectInput, TextArea } from '../../../components/ui/Field'
import { TimestampField } from '../TimestampField'
import { ProvenanceFields, DEFAULT_PROVENANCE, type ProvenanceValue } from '../ProvenanceFields'
import { toDateTimeLocalValue, fromDateTimeLocalValue } from '../../../utils/date'
import { parseOptionalNumber, defaultTimestamp, type FormProps } from './formShared'

type FoodEntry = LogEntryOfCategory<'food'>

export function FoodForm({ entry, formId, onSubmit }: FormProps<FoodEntry>) {
  const [when, setWhen] = useState(entry ? toDateTimeLocalValue(entry.timestamp) : toDateTimeLocalValue(defaultTimestamp()))
  const [subtype, setSubtype] = useState<FoodSubtype>(entry?.subtype ?? 'meal')
  const [title, setTitle] = useState(entry?.title ?? '')
  const [quantity, setQuantity] = useState(entry?.detail.quantity?.toString() ?? '')
  const [unit, setUnit] = useState(entry?.detail.unit ?? '')
  const [calories, setCalories] = useState(entry?.detail.calories?.toString() ?? '')
  const [proteinG, setProteinG] = useState(entry?.detail.proteinG?.toString() ?? '')
  const [carbsG, setCarbsG] = useState(entry?.detail.carbsG?.toString() ?? '')
  const [fatG, setFatG] = useState(entry?.detail.fatG?.toString() ?? '')
  const [fiberG, setFiberG] = useState(entry?.detail.fiberG?.toString() ?? '')
  const [sugarG, setSugarG] = useState(entry?.detail.sugarG?.toString() ?? '')
  const [micronutrientNote, setMicronutrientNote] = useState(entry?.detail.micronutrientNote ?? '')
  const [notes, setNotes] = useState(entry?.notes ?? '')
  const [provenance, setProvenance] = useState<ProvenanceValue>(
    entry ? { source: entry.source, measurementStatus: entry.measurementStatus, confidence: entry.confidence } : DEFAULT_PROVENANCE,
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      category: 'food',
      subtype,
      timestamp: fromDateTimeLocalValue(when),
      title: title.trim() || 'Food',
      notes: notes.trim() || undefined,
      detail: {
        quantity: parseOptionalNumber(quantity),
        unit: unit.trim() || undefined,
        calories: parseOptionalNumber(calories),
        proteinG: parseOptionalNumber(proteinG),
        carbsG: parseOptionalNumber(carbsG),
        fatG: parseOptionalNumber(fatG),
        fiberG: parseOptionalNumber(fiberG),
        sugarG: parseOptionalNumber(sugarG),
        micronutrientNote: micronutrientNote.trim() || undefined,
      },
      ...provenance,
    })
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TextInput label="What did you eat?" id="food-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 2 croissants" required />
      <div className="grid grid-cols-2 gap-3">
        <SelectInput label="Type" value={subtype} onChange={(e) => setSubtype(e.target.value as FoodSubtype)}>
          <option value="meal">Meal</option>
          <option value="snack">Snack</option>
        </SelectInput>
        <TimestampField value={when} onChange={setWhen} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <NumberInput label="Quantity" id="food-qty" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 150" step="any" min={0} />
        <TextInput label="Unit" id="food-unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="g, piece, cup…" />
      </div>
      <NumberInput label="Calories" id="food-cal" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="kcal" step="any" min={0} />
      <div className="grid grid-cols-2 gap-3">
        <NumberInput label="Protein (g)" id="food-p" value={proteinG} onChange={(e) => setProteinG(e.target.value)} step="any" min={0} />
        <NumberInput label="Carbs (g)" id="food-c" value={carbsG} onChange={(e) => setCarbsG(e.target.value)} step="any" min={0} />
        <NumberInput label="Fat (g)" id="food-f" value={fatG} onChange={(e) => setFatG(e.target.value)} step="any" min={0} />
        <NumberInput label="Fiber (g)" id="food-fi" value={fiberG} onChange={(e) => setFiberG(e.target.value)} step="any" min={0} />
      </div>
      <NumberInput label="Sugar (g)" id="food-su" value={sugarG} onChange={(e) => setSugarG(e.target.value)} step="any" min={0} />
      <TextInput
        label="Micronutrient note (optional)"
        id="food-micro"
        value={micronutrientNote}
        onChange={(e) => setMicronutrientNote(e.target.value)}
        placeholder="e.g. good source of iron"
      />
      <TextArea label="Notes" id="food-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
      <ProvenanceFields value={provenance} onChange={setProvenance} />
    </form>
  )
}
