import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import clsx from 'clsx'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { useEntriesByDateMap, useEntryCount } from '../../hooks/useEntries'
import { calculateDateRangeAverage, calculateTrendSeries, TREND_METRIC_LABELS, TREND_METRIC_UNITS, type TrendMetric } from '../../services/trends'
import { localDateRange, shiftLocalDate, todayLocalDate, formatShortDate } from '../../utils/date'
import { LineChart as LineChartIcon } from 'lucide-react'

type Range = '7' | '30' | '90'

const METRIC_GROUPS: { label: string; metrics: TrendMetric[] }[] = [
  { label: 'Nutrition', metrics: ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar'] },
  { label: 'Hydration', metrics: ['water', 'fluids'] },
  { label: 'Lifestyle', metrics: ['sleep', 'caffeine', 'nicotine', 'cannabis', 'alcohol'] },
  { label: 'Activity', metrics: ['steps', 'running_distance', 'running_frequency', 'exercise_frequency', 'strength_sessions'] },
  { label: 'Subjective', metrics: ['mood', 'energy', 'appetite', 'concentration'] },
  { label: 'Body', metrics: ['weight'] },
]

export function TrendsScreen() {
  const [range, setRange] = useState<Range>('7')
  const [metric, setMetric] = useState<TrendMetric>('calories')
  const entryCount = useEntryCount()

  const days = Number(range)
  const today = todayLocalDate()
  const dates = useMemo(() => localDateRange(today, days), [today, days])
  const entriesByDate = useEntriesByDateMap(shiftLocalDate(today, -(days - 1)), today)

  const series = useMemo(() => (entriesByDate ? calculateTrendSeries(dates, entriesByDate, metric) : []), [dates, entriesByDate, metric])
  const avg = calculateDateRangeAverage(series)
  const unit = TREND_METRIC_UNITS[metric] ?? ''

  const chartData = series.map((p) => ({
    date: formatShortDate(p.date),
    value: p.logged ? p.value : null,
  }))

  if (entryCount !== undefined && entryCount < 3) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-[var(--color-ink)]">Trends</h1>
        <EmptyState icon={<LineChartIcon size={28} />} title="Log a few days to unlock useful trends" description="Trends need at least a handful of logged days to be meaningful." />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[var(--color-ink)]">Trends</h1>
        <SegmentedControl
          value={range}
          onChange={setRange}
          options={[
            { value: '7', label: '7d' },
            { value: '30', label: '30d' },
            { value: '90', label: '90d' },
          ]}
        />
      </header>

      <div className="flex flex-col gap-3">
        {METRIC_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-ink-faint)]">{group.label}</p>
            <div className="flex flex-wrap gap-2">
              {group.metrics.map((m) => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className={clsx(
                    'tap-target rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                    metric === m
                      ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)]'
                      : 'border-[var(--color-border)] text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-alt)]',
                  )}
                >
                  {TREND_METRIC_LABELS[m]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Card className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs font-medium text-[var(--color-ink-soft)]">Average {TREND_METRIC_LABELS[metric].toLowerCase()}</p>
            <p className="text-2xl font-semibold tabular-nums text-[var(--color-ink)]">
              {avg.average !== undefined ? `${Math.round(avg.average * 10) / 10} ${unit}` : 'Not enough data'}
            </p>
          </div>
          <p className="text-xs text-[var(--color-ink-faint)]">
            Logged {avg.loggedDays} of {avg.totalDays} days
          </p>
        </div>

        {avg.loggedDays > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-ink-faint)' }} interval={days > 14 ? Math.floor(days / 8) : 0} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--color-ink-faint)' }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                  tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : `${v}`)}
                />
                <Tooltip
                  formatter={(value) => [`${value ?? '—'} ${unit}`, TREND_METRIC_LABELS[metric]]}
                  contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="value" fill="var(--color-brand-500)" radius={[4, 4, 0, 0]} maxBarSize={days > 30 ? 6 : 18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-[var(--color-ink-soft)]">No {TREND_METRIC_LABELS[metric].toLowerCase()} logged in this range yet.</p>
        )}
      </Card>
    </div>
  )
}
