import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] px-6 py-10 text-center">
      {icon && <div className="mb-1 text-[var(--color-ink-faint)]">{icon}</div>}
      <p className="text-[15px] font-medium text-[var(--color-ink)]">{title}</p>
      {description && <p className="max-w-xs text-sm text-[var(--color-ink-soft)]">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
