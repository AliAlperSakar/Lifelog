import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek } from 'date-fns'
import clsx from 'clsx'
import { toLocalDate, todayLocalDate } from '../../utils/date'
import { IconButton } from '../../components/ui/IconButton'

interface MonthCalendarProps {
  monthCursor: Date
  onMonthChange: (d: Date) => void
  selectedDate: string
  onSelectDate: (d: string) => void
  datesWithData: Set<string>
}

export function MonthCalendar({ monthCursor, onMonthChange, selectedDate, onSelectDate, datesWithData }: MonthCalendarProps) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthCursor), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(monthCursor), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [monthCursor])

  const today = todayLocalDate()

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-sm font-semibold text-[var(--color-ink)]">{format(monthCursor, 'MMMM yyyy')}</span>
        <div className="flex gap-1">
          <IconButton aria-label="Previous month" onClick={() => onMonthChange(addMonths(monthCursor, -1))}>
            <ChevronLeft size={18} />
          </IconButton>
          <IconButton aria-label="Next month" onClick={() => onMonthChange(addMonths(monthCursor, 1))}>
            <ChevronRight size={18} />
          </IconButton>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-[var(--color-ink-faint)]">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const localDate = toLocalDate(day)
          const inMonth = isSameMonth(day, monthCursor)
          const hasData = datesWithData.has(localDate)
          const isSelected = localDate === selectedDate
          const isToday = localDate === today
          return (
            <button
              key={localDate}
              onClick={() => onSelectDate(localDate)}
              className={clsx(
                'tap-target relative flex aspect-square flex-col items-center justify-center rounded-full text-[13px] transition-colors',
                !inMonth && 'text-[var(--color-ink-faint)]/50',
                inMonth && !isSelected && 'text-[var(--color-ink)] hover:bg-[var(--color-surface-alt)]',
                isSelected && 'bg-[var(--color-brand-600)] text-white',
                isToday && !isSelected && 'font-semibold text-[var(--color-brand-600)]',
              )}
            >
              {format(day, 'd')}
              {hasData && <span className={clsx('absolute bottom-1 h-1 w-1 rounded-full', isSelected ? 'bg-white' : 'bg-[var(--color-brand-500)]')} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
