import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { useDailySummary, useEntriesForDate } from '../../hooks/useEntries'
import { useGoals } from '../../hooks/useProfile'
import { useQuickLog } from '../../app/QuickLogContext'
import { todayLocalDate, formatDayHeading } from '../../utils/date'
import { NutritionCard } from './NutritionCard'
import { QuickMetricsGrid } from './QuickMetricsGrid'
import { GoalsWidget } from './GoalsWidget'
import { EntryTimeline } from '../log/EntryTimeline'

export function TodayScreen() {
  const date = todayLocalDate()
  const entries = useEntriesForDate(date)
  const summary = useDailySummary(date)
  const goals = useGoals()
  const { openCreate } = useQuickLog()

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-faint)]">Today</p>
          <h1 className="text-xl font-semibold text-[var(--color-ink)]">{formatDayHeading(date)}</h1>
        </div>
        <Link
          to={`/report/${date}`}
          className="tap-target flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-alt)]"
        >
          <FileText size={15} /> Report
        </Link>
      </header>

      {!entries || !summary ? (
        <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-alt)]" />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_minmax(0,1fr)] sm:items-start">
          <div className="flex flex-col gap-4 sm:order-1">
            <NutritionCard nutrition={summary.nutrition} />
            <QuickMetricsGrid summary={summary} />
          </div>

          <div className="sm:order-2">
            <h2 className="mb-3 text-sm font-semibold text-[var(--color-ink)]">Timeline</h2>
            <EntryTimeline entries={entries} emptyAction={() => openCreate()} />
          </div>

          <div className="flex flex-col gap-4 sm:order-3">{goals && <GoalsWidget goals={goals} summary={summary} />}</div>
        </div>
      )}
    </div>
  )
}
