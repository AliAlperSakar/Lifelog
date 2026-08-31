import type { ReactNode } from 'react'
import clsx from 'clsx'

interface BadgeProps {
  children: ReactNode
  tone?: 'neutral' | 'good' | 'warn' | 'alert' | 'info'
}

const toneClasses: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral: 'bg-[var(--color-surface-alt)] text-[var(--color-ink-soft)]',
  good: 'bg-[var(--color-good)]/10 text-[var(--color-good)]',
  warn: 'bg-[var(--color-warn)]/10 text-[var(--color-warn)]',
  alert: 'bg-[var(--color-alert)]/10 text-[var(--color-alert)]',
  info: 'bg-[var(--color-info)]/10 text-[var(--color-info)]',
}

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', toneClasses[tone])}>
      {children}
    </span>
  )
}
