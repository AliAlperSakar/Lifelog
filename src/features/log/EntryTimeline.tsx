import type { LogEntry } from '../../domain/types'
import { CATEGORY_META } from '../../domain/categoryMeta'
import { formatTime } from '../../utils/date'
import { describeEntry } from './entrySummary'
import { useQuickLog } from '../../app/QuickLogContext'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { CalendarClock } from 'lucide-react'

interface EntryTimelineProps {
  entries: LogEntry[]
  emptyAction?: () => void
}

export function EntryTimeline({ entries, emptyAction }: EntryTimelineProps) {
  const { openEdit } = useQuickLog()

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<CalendarClock size={28} />}
        title="Nothing logged yet"
        description="Start with your first meal, drink, activity, or sleep entry."
        action={emptyAction && <Button onClick={emptyAction}>Log something</Button>}
      />
    )
  }

  return (
    <ol className="flex flex-col gap-2">
      {entries.map((entry) => {
        const meta = CATEGORY_META[entry.category]
        const Icon = meta.icon
        const summary = describeEntry(entry)
        return (
          <li key={entry.id}>
            <button
              onClick={() => openEdit(entry)}
              className="tap-target flex w-full items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-left transition-colors hover:bg-[var(--color-surface-alt)]"
            >
              <span
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}
              >
                <Icon size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[15px] font-medium text-[var(--color-ink)]">{summary.title}</span>
                  <span className="shrink-0 text-xs tabular-nums text-[var(--color-ink-faint)]">{formatTime(entry.timestamp)}</span>
                </span>
                {summary.lines.length > 0 && (
                  <span className="mt-0.5 block truncate text-sm text-[var(--color-ink-soft)]">{summary.lines.filter(Boolean).join(' · ')}</span>
                )}
                {summary.approximate && (
                  <span className="mt-1 inline-block">
                    <Badge tone="neutral">Estimated</Badge>
                  </span>
                )}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
