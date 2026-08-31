import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'
import type { DailySummary } from '../../services/aggregation'
import { formatDayHeading } from '../../utils/date'
import { formatApprox } from '../../utils/format'

export function DaySummaryHeader({ localDate, summary, entryCount }: { localDate: string; summary: DailySummary; entryCount: number }) {
  const bits: string[] = []
  if (summary.nutrition.calories) bits.push(`${formatApprox(summary.nutrition.calories.value, 'approximate')} kcal`)
  if (summary.nutrition.proteinG) bits.push(`${formatApprox(summary.nutrition.proteinG.value, 'approximate')} g protein`)
  if (summary.sleep?.minutes !== undefined) bits.push(`Sleep ~${Math.floor(summary.sleep.minutes / 60)}h ${summary.sleep.minutes % 60}m`)

  return (
    <div className="flex items-start justify-between gap-2">
      <div>
        <h2 className="text-base font-semibold text-[var(--color-ink)]">{formatDayHeading(localDate)}</h2>
        <p className="mt-0.5 text-sm text-[var(--color-ink-soft)]">
          {bits.length > 0 ? bits.join(' · ') : 'No summary yet'} · {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
        </p>
      </div>
      {entryCount > 0 && (
        <Link
          to={`/report/${localDate}`}
          className="tap-target flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-alt)]"
        >
          <FileText size={13} /> Report
        </Link>
      )}
    </div>
  )
}
