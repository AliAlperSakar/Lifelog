import clsx from 'clsx'

interface Option<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[]
  value: T
  onChange: (v: T) => void
}

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div className="inline-flex rounded-[var(--radius-control)] bg-[var(--color-surface-alt)] p-1" role="tablist">
      {options.map((opt) => (
        <button
          key={opt.value}
          role="tab"
          aria-selected={opt.value === value}
          onClick={() => onChange(opt.value)}
          className={clsx(
            'tap-target rounded-[calc(var(--radius-control)-2px)] px-3 py-1.5 text-sm font-medium transition-colors',
            opt.value === value ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm' : 'text-[var(--color-ink-soft)]',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
