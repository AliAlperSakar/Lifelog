import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import clsx from 'clsx'

interface FieldShellProps {
  label: string
  error?: string
  hint?: string
  children: ReactNode
  htmlFor?: string
}

export function FieldShell({ label, error, hint, children, htmlFor }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-[var(--color-ink-soft)]">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <span className="text-xs text-[var(--color-ink-faint)]">{hint}</span>}
      {error && <span className="text-xs text-[var(--color-alert)]">{error}</span>}
    </div>
  )
}

const inputBase =
  'tap-target w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-[16px] text-[var(--color-ink)] outline-none transition-shadow focus:ring-2 focus:ring-[var(--color-brand-500)]/40 focus:border-[var(--color-brand-500)]'

type NumberFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: string
}

export function NumberInput({ label, error, hint, id, className, ...rest }: NumberFieldProps) {
  return (
    <FieldShell label={label} error={error} hint={hint} htmlFor={id}>
      <input id={id} type="number" inputMode="decimal" className={clsx(inputBase, className)} {...rest} />
    </FieldShell>
  )
}

export function TextInput({
  label,
  error,
  hint,
  id,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }) {
  return (
    <FieldShell label={label} error={error} hint={hint} htmlFor={id}>
      <input id={id} type="text" className={clsx(inputBase, className)} {...rest} />
    </FieldShell>
  )
}

export function TextArea({
  label,
  error,
  hint,
  id,
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; hint?: string }) {
  return (
    <FieldShell label={label} error={error} hint={hint} htmlFor={id}>
      <textarea id={id} rows={3} className={clsx(inputBase, 'resize-none', className)} {...rest} />
    </FieldShell>
  )
}

export function SelectInput({
  label,
  error,
  hint,
  id,
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <FieldShell label={label} error={error} hint={hint} htmlFor={id}>
      <select id={id} className={clsx(inputBase, className)} {...rest}>
        {children}
      </select>
    </FieldShell>
  )
}
