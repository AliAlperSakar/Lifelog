import { useState } from 'react'
import { endOfMonth, startOfMonth } from 'date-fns'
import { MonthCalendar } from './MonthCalendar'
import { DaySummaryHeader } from './DaySummaryHeader'
import { EntryTimeline } from '../log/EntryTimeline'
import { useDatesWithData, useDailySummary, useEntriesForDate } from '../../hooks/useEntries'
import { useQuickLog } from '../../app/QuickLogContext'
import { todayLocalDate, toLocalDate } from '../../utils/date'

export function HistoryScreen() {
  const [monthCursor, setMonthCursor] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(todayLocalDate())
  const { openCreate } = useQuickLog()

  const rangeStart = toLocalDate(startOfMonth(monthCursor))
  const rangeEnd = toLocalDate(endOfMonth(monthCursor))
  const datesWithData = useDatesWithData(rangeStart, rangeEnd)
  const entries = useEntriesForDate(selectedDate)
  const summary = useDailySummary(selectedDate)

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-semibold text-[var(--color-ink)]">History</h1>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[320px_minmax(0,1fr)] sm:items-start">
        <MonthCalendar
          monthCursor={monthCursor}
          onMonthChange={setMonthCursor}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          datesWithData={datesWithData ?? new Set()}
        />

        <div className="flex flex-col gap-4">
          {summary && <DaySummaryHeader localDate={selectedDate} summary={summary} entryCount={entries?.length ?? 0} />}
          {entries ? (
            <EntryTimeline entries={entries} emptyAction={() => openCreate()} />
          ) : (
            <div className="h-24 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-alt)]" />
          )}
        </div>
      </div>
    </div>
  )
}
