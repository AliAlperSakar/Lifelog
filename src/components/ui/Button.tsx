import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'md' | 'sm'
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-700)] active:scale-[0.98]',
  secondary:
    'bg-[var(--color-surface-alt)] text-[var(--color-ink)] border border-[var(--color-border)] hover:bg-[var(--color-brand-50)]',
  ghost: 'bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-surface-alt)]',
  danger: 'bg-transparent text-[var(--color-alert)] border border-[var(--color-alert)]/30 hover:bg-[var(--color-alert)]/10',
}

export function Button({ variant = 'primary', size = 'md', className, ...rest }: ButtonProps) {
  return (
    <button
      className={clsx(
        'tap-target inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] font-medium transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none',
        size === 'md' ? 'px-4 py-2.5 text-[15px]' : 'px-3 py-1.5 text-sm',
        variantClasses[variant],
        className,
      )}
      {...rest}
    />
  )
}
