import { useState } from 'react'
import type { LogEntryOfCategory, ActivitySubtype, Intensity } from '../../../domain/types'
import { NumberInput, SelectInput, TextArea } from '../../../components/ui/Field'
import { TimestampField } from '../TimestampField'
import { toDateTimeLocalValue, fromDateTimeLocalValue } from '../../../utils/date'
import { ACTIVITY_LABELS } from '../../../domain/categoryMeta'
import { parseOptionalNumber, defaultTimestamp, type FormProps } from './formShared'

type ActivityEntry = LogEntryOfCategory<'activity'>

export function ActivityForm({ entry, formId, onSubmit }: FormProps<ActivityEntry>) {
  const [when, setWhen] = useState(entry ? toDateTimeLocalValue(entry.timestamp) : toDateTimeLocalValue(defaultTimestamp()))
  const [subtype, setSubtype] = useState<ActivitySubtype>(entry?.subtype ?? 'walking')
  const [durationMin, setDurationMin] = useState(entry?.detail.durationMin?.toString() ?? '')
  const [distanceKm, setDistanceKm] = useState(entry?.detail.distanceKm?.toString() ?? '')
  const [intensity, setIntensity] = useState<Intensity | ''>(entry?.detail.intensity ?? '')
  const [estimatedKcal, setEstimatedKcal] = useState(entry?.detail.estimatedKcal?.toString() ?? '')
  const [notes, setNotes] = useState(entry?.notes ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      category: 'activity',
      subtype,
      timestamp: fromDateTimeLocalValue(when),
      title: ACTIVITY_LABELS[subtype],
      notes: notes.trim() || undefined,
      detail: {
        durationMin: parseOptionalNumber(durationMin),
        distanceKm: parseOptionalNumber(distanceKm),
        intensity: intensity || undefined,
        estimatedKcal: parseOptionalNumber(estimatedKcal),
      },
    })
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <SelectInput label="Type" value={subtype} onChange={(e) => setSubtype(e.target.value as ActivitySubtype)}>
          {(Object.keys(ACTIVITY_LABELS) as ActivitySubtype[]).map((s) => (
            <option key={s} value={s}>
              {ACTIVITY_LABELS[s]}
            </option>
          ))}
        </SelectInput>
        <TimestampField value={when} onChange={setWhen} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <NumberInput label="Duration (min)" id="act-dur" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} step="any" min={0} />
        <NumberInput label="Distance (km)" id="act-dist" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} step="any" min={0} />
      </div>
      <SelectInput label="Intensity" value={intensity} onChange={(e) => setIntensity(e.target.value as Intensity)}>
        <option value="">Not specified</option>
        <option value="low">Low</option>
        <option value="moderate">Moderate</option>
        <option value="high">High</option>
      </SelectInput>
      <NumberInput
        label="Estimated energy expenditure (kcal)"
        id="act-kcal"
        value={estimatedKcal}
        onChange={(e) => setEstimatedKcal(e.target.value)}
        step="any"
        min={0}
        hint="Always shown as an estimate unless you enter a measured value"
      />
      <TextArea label="Notes" id="act-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
    </form>
  )
}
