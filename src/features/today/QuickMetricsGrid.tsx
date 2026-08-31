import { Droplet, Moon, Footprints, Coffee, Flame, Cigarette } from 'lucide-react'
import type { DailySummary } from '../../services/aggregation'
import { StatTile } from '../../components/ui/StatTile'
import { formatDuration } from '../../utils/date'
import { formatMl } from '../../utils/format'

/** Only renders tiles for metrics that actually have data — an unlogged
 * metric is simply absent, never shown as a false zero (spec §13, §55). */
export function QuickMetricsGrid({ summary }: { summary: DailySummary }) {
  const tiles: { key: string; label: string; value: string; sublabel?: string; icon: React.ReactNode }[] = []

  if (summary.water) tiles.push({ key: 'water', label: 'Water', value: formatMl(summary.water.value), icon: <Droplet size={16} /> })
  if (summary.sleep?.minutes !== undefined)
    tiles.push({ key: 'sleep', label: 'Sleep', value: `~${formatDuration(summary.sleep.minutes)}`, icon: <Moon size={16} /> })
  if (summary.steps) tiles.push({ key: 'steps', label: 'Steps', value: Math.round(summary.steps.value).toLocaleString(), icon: <Footprints size={16} /> })
  if (summary.caffeineMg) tiles.push({ key: 'caffeine', label: 'Caffeine', value: `~${Math.round(summary.caffeineMg.value)} mg`, icon: <Coffee size={16} /> })
  if (summary.activity.estimatedKcal)
    tiles.push({ key: 'activity', label: 'Activity', value: `~${Math.round(summary.activity.estimatedKcal.value)} kcal`, icon: <Flame size={16} /> })
  if (summary.nicotine) tiles.push({ key: 'nicotine', label: 'Nicotine', value: `${summary.nicotine.value}×`, icon: <Cigarette size={16} /> })

  if (tiles.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-3">
      {tiles.map((t) => (
        <StatTile key={t.key} label={t.label} value={t.value} icon={t.icon} />
      ))}
    </div>
  )
}
