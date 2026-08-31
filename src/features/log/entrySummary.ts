import type { LogEntry } from '../../domain/types'
import { NICOTINE_LABELS, SUBJECTIVE_LABELS, SYMPTOM_LABELS, ACTIVITY_LABELS } from '../../domain/categoryMeta'
import { APPETITE_LABELS, SLEEP_QUALITY_LABELS } from '../../domain/types'
import { formatDuration } from '../../utils/date'
import { formatApprox, formatMl } from '../../utils/format'

export interface EntrySummary {
  title: string
  /** Short secondary lines shown under the title in a timeline card. */
  lines: string[]
  approximate: boolean
}

export function describeEntry(e: LogEntry): EntrySummary {
  const approximate = 'measurementStatus' in e && e.measurementStatus === 'approximate'

  switch (e.category) {
    case 'food': {
      const lines: string[] = []
      if (e.detail.quantity !== undefined) lines.push(`${formatApprox(e.detail.quantity, e.measurementStatus, e.detail.quantity < 10 ? 1 : 0)} ${e.detail.unit ?? ''}`.trim())
      if (e.detail.calories !== undefined) lines.push(`${formatApprox(e.detail.calories, e.measurementStatus)} kcal`)
      const macros = [
        e.detail.proteinG !== undefined ? `P ${formatApprox(e.detail.proteinG, e.measurementStatus)}g` : null,
        e.detail.carbsG !== undefined ? `C ${formatApprox(e.detail.carbsG, e.measurementStatus)}g` : null,
        e.detail.fatG !== undefined ? `F ${formatApprox(e.detail.fatG, e.measurementStatus)}g` : null,
      ].filter(Boolean)
      if (macros.length) lines.push(macros.join(' · '))
      return { title: e.title ?? 'Food', lines, approximate }
    }
    case 'drink': {
      const lines: string[] = []
      if (e.detail.volumeMl !== undefined) lines.push(formatMl(e.detail.volumeMl))
      if (e.detail.calories !== undefined) lines.push(`${formatApprox(e.detail.calories, e.measurementStatus)} kcal`)
      if (e.detail.caffeineMg !== undefined) lines.push(`${formatApprox(e.detail.caffeineMg, e.measurementStatus)} mg caffeine`)
      return { title: e.title ?? 'Drink', lines, approximate }
    }
    case 'water':
      return { title: 'Water', lines: [formatMl(e.detail.volumeMl)], approximate: false }
    case 'activity': {
      const lines: string[] = []
      if (e.detail.durationMin !== undefined) lines.push(formatDuration(e.detail.durationMin))
      if (e.detail.distanceKm !== undefined) lines.push(`${e.detail.distanceKm} km`)
      if (e.detail.estimatedKcal !== undefined) lines.push(`~${Math.round(e.detail.estimatedKcal)} kcal`)
      return { title: e.title ?? ACTIVITY_LABELS[e.subtype] ?? 'Activity', lines, approximate: true }
    }
    case 'running': {
      const lines: string[] = []
      if (e.detail.distanceKm !== undefined) lines.push(`${e.detail.distanceKm} km`)
      if (e.detail.durationMin !== undefined) lines.push(formatDuration(e.detail.durationMin))
      if (e.detail.distanceKm && e.detail.durationMin) {
        const pace = e.detail.durationMin / e.detail.distanceKm
        const min = Math.floor(pace)
        const sec = Math.round((pace - min) * 60)
        lines.push(`${min}:${sec.toString().padStart(2, '0')} /km`)
      }
      return { title: e.title ?? 'Running', lines, approximate: true }
    }
    case 'strength': {
      const lines: string[] = []
      if (e.detail.durationMin !== undefined) lines.push(formatDuration(e.detail.durationMin))
      if (e.detail.exercises?.length) lines.push(e.detail.exercises.map((ex) => ex.name).join(', '))
      return { title: e.title ?? (e.detail.focus === 'legs_knee' ? 'Leg/knee training' : 'Strength training'), lines, approximate: false }
    }
    case 'steps':
      return { title: 'Steps', lines: [`${e.detail.steps.toLocaleString()} steps`], approximate: false }
    case 'sleep': {
      const lines: string[] = []
      if (e.detail.reportedDurationText) lines.push(e.detail.reportedDurationText)
      else if (e.detail.reportedDurationMin) lines.push(formatDuration(e.detail.reportedDurationMin))
      if (e.detail.quality) lines.push(SLEEP_QUALITY_LABELS[e.detail.quality])
      return { title: e.title ?? 'Sleep', lines, approximate: e.detail.reportedDurationMin !== undefined }
    }
    case 'nicotine':
      return {
        title: e.title ?? NICOTINE_LABELS[e.subtype],
        lines: [`${e.detail.count ?? 1}×${e.detail.amountMg ? ` · ${e.detail.amountMg} mg` : ''}`],
        approximate: false,
      }
    case 'cannabis':
      return { title: e.title ?? 'Cannabis', lines: [e.detail.method ?? '', e.detail.amount ?? ''].filter(Boolean), approximate: false }
    case 'alcohol': {
      const lines: string[] = []
      if (e.detail.volumeMl) lines.push(formatMl(e.detail.volumeMl))
      if (e.detail.units) lines.push(`~${e.detail.units.toFixed(1)} units`)
      return { title: e.title ?? e.detail.beverage ?? 'Alcohol', lines, approximate: true }
    }
    case 'subjective':
      return { title: SUBJECTIVE_LABELS[e.subtype], lines: [e.subtype === 'appetite' ? APPETITE_LABELS[e.detail.rating] : `${e.detail.rating} / 5`], approximate: false }
    case 'symptom':
      return {
        title: e.title ?? SYMPTOM_LABELS[e.subtype],
        lines: [e.detail.severity ? `Severity ${e.detail.severity}/5` : '', e.detail.durationMin ? formatDuration(e.detail.durationMin) : ''].filter(Boolean),
        approximate: false,
      }
    case 'weight':
      return { title: 'Body weight', lines: [`${formatApprox(e.detail.weightKg, e.measurementStatus, 1)} kg`], approximate }
    case 'note':
      return { title: e.title ?? 'Note', lines: [e.detail.text], approximate: false }
  }
}
