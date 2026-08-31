import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useEntriesForDate } from '../../hooks/useEntries'
import { useGoals } from '../../hooks/useProfile'
import { generateDailyReport } from '../../services/dailyReport'
import { formatDayHeading } from '../../utils/date'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { FileText } from 'lucide-react'

function Section({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null
  return (
    <div>
      <h3 className="mb-1.5 text-sm font-semibold text-[var(--color-ink)]">{title}</h3>
      <ul className="flex flex-col gap-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-[var(--color-ink-soft)]">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function DailyReportScreen() {
  const { date } = useParams<{ date: string }>()
  const localDate = date ?? ''
  const entries = useEntriesForDate(localDate)
  const goals = useGoals()

  const report = useMemo(() => (entries ? generateDailyReport(localDate, entries, goals ?? []) : undefined), [entries, goals, localDate])

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Link to="/" className="tap-target -ml-1 text-[var(--color-ink-soft)]">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-faint)]">Daily report</p>
          <h1 className="text-lg font-semibold text-[var(--color-ink)]">{formatDayHeading(localDate)}</h1>
        </div>
      </header>

      {!entries || !report ? (
        <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-alt)]" />
      ) : entries.length === 0 ? (
        <EmptyState icon={<FileText size={28} />} title="Nothing to report" description="Log a few things for this day to generate a report." />
      ) : (
        <>
          <Card className="flex flex-col gap-4">
            <Section title="Food" items={report.food} />
            <Section title="Activity" items={report.activity} />
            <Section title="Lifestyle" items={report.lifestyle} />
          </Card>

          {report.wentWell.length > 0 && (
            <Card className="flex flex-col gap-2 border-[var(--color-good)]/25 bg-[var(--color-good)]/5">
              <h3 className="text-sm font-semibold text-[var(--color-good)]">What went well</h3>
              <ul className="flex flex-col gap-1">
                {report.wentWell.map((item, i) => (
                  <li key={i} className="text-sm text-[var(--color-ink)]">
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {report.couldImprove.length > 0 && (
            <Card className="flex flex-col gap-2 border-[var(--color-warn)]/25 bg-[var(--color-warn)]/5">
              <h3 className="text-sm font-semibold text-[var(--color-warn)]">Could improve</h3>
              <ul className="flex flex-col gap-1">
                {report.couldImprove.map((item, i) => (
                  <li key={i} className="text-sm text-[var(--color-ink)]">
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {report.tomorrow.length > 0 && (
            <Card className="flex flex-col gap-2 border-[var(--color-info)]/25 bg-[var(--color-info)]/5">
              <h3 className="text-sm font-semibold text-[var(--color-info)]">Tomorrow</h3>
              <ul className="flex flex-col gap-1">
                {report.tomorrow.map((item, i) => (
                  <li key={i} className="text-sm text-[var(--color-ink)]">
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <p className="text-xs text-[var(--color-ink-faint)]">
            This report is generated automatically from what you logged. It describes patterns, not medical advice, and correlation shown here is not
            causation.
          </p>
        </>
      )}
    </div>
  )
}
