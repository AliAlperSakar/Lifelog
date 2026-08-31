import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string
}

export function IconButton({ className, ...rest }: IconButtonProps) {
  return (
    <button
      className={clsx(
        'tap-target inline-flex items-center justify-center rounded-full text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-ink)] transition-colors',
        className,
      )}
      {...rest}
    />
  )
}
