import type { Confidence, EntrySource, MeasurementStatus } from '../../domain/types'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { SelectInput } from '../../components/ui/Field'

export interface ProvenanceValue {
  source: EntrySource
  measurementStatus: MeasurementStatus
  confidence: Confidence
}

const SOURCE_LABELS: Record<EntrySource, string> = {
  manual: 'Manual',
  label: 'Nutrition label',
  database: 'Food database',
  ai: 'AI estimate',
  calculated: 'Calculated',
  device: 'Device',
  demo: 'Demo',
}

export function ProvenanceFields({ value, onChange }: { value: ProvenanceValue; onChange: (v: ProvenanceValue) => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-card)] bg-[var(--color-surface-alt)] p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-[var(--color-ink-soft)]">Measurement</span>
        <SegmentedControl
          value={value.measurementStatus}
          onChange={(v) => onChange({ ...value, measurementStatus: v })}
          options={[
            { value: 'exact', label: 'Exact' },
            { value: 'approximate', label: 'Approximate' },
          ]}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SelectInput
          label="Source"
          value={value.source}
          onChange={(e) => onChange({ ...value, source: e.target.value as EntrySource })}
        >
          {(Object.keys(SOURCE_LABELS) as EntrySource[])
            .filter((s) => s !== 'demo')
            .map((s) => (
              <option key={s} value={s}>
                {SOURCE_LABELS[s]}
              </option>
            ))}
        </SelectInput>
        <SelectInput
          label="Confidence"
          value={value.confidence}
          onChange={(e) => onChange({ ...value, confidence: e.target.value as Confidence })}
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </SelectInput>
      </div>
    </div>
  )
}

export const DEFAULT_PROVENANCE: ProvenanceValue = { source: 'manual', measurementStatus: 'approximate', confidence: 'medium' }
