import { NavLink } from 'react-router-dom'
import { CalendarDays, Home, LineChart, Plus, Settings, User } from 'lucide-react'
import clsx from 'clsx'
import { useQuickLog } from '../../app/QuickLogContext'

const items = [
  { to: '/', label: 'Today', icon: Home, end: true },
  { to: '/history', label: 'History', icon: CalendarDays, end: false },
  { to: '/trends', label: 'Trends', icon: LineChart, end: false },
  { to: '/profile', label: 'Profile', icon: User, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
] as const

export function SideNav() {
  const { openCreate } = useQuickLog()

  return (
    <aside className="safe-top hidden w-60 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-6 sm:flex">
      <div className="mb-6 px-2">
        <span className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">LifeLog</span>
      </div>

      <button
        onClick={() => openCreate()}
        className="tap-target mb-6 flex items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-brand-600)] px-4 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-[var(--color-brand-700)]"
      >
        <Plus size={18} /> Log something
      </button>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Primary">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                'tap-target flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-[15px] font-medium transition-colors',
                isActive
                  ? 'bg-[var(--color-brand-50)] text-[var(--color-brand-700)]'
                  : 'text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-alt)]',
              )
            }
          >
            <Icon size={19} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
