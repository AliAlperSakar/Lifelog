interface TimestampFieldProps {
  value: string
  onChange: (v: string) => void
}

export function TimestampField({ value, onChange }: TimestampFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="entry-time" className="text-sm font-medium text-[var(--color-ink-soft)]">
        When
      </label>
      <input
        id="entry-time"
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="tap-target w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-[16px] text-[var(--color-ink)] outline-none focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/40"
      />
    </div>
  )
}
