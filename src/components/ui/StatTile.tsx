import type { ReactNode } from 'react'
import clsx from 'clsx'

interface StatTileProps {
  label: string
  value: ReactNode
  sublabel?: ReactNode
  icon?: ReactNode
  onClick?: () => void
}

export function StatTile({ label, value, sublabel, icon, onClick }: StatTileProps) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      onClick={onClick}
      className={clsx(
        'flex flex-col gap-1 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 text-left',
        onClick && 'tap-target active:scale-[0.98] transition-transform',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--color-ink-soft)]">{label}</span>
        {icon && <span className="text-[var(--color-ink-faint)]">{icon}</span>}
      </div>
      <span className="text-lg font-semibold tabular-nums text-[var(--color-ink)]">{value}</span>
      {sublabel && <span className="text-xs text-[var(--color-ink-faint)]">{sublabel}</span>}
    </Comp>
  )
}
