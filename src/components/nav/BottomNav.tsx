import { NavLink } from 'react-router-dom'
import { CalendarDays, Home, LineChart, Plus, User } from 'lucide-react'
import clsx from 'clsx'
import { useQuickLog } from '../../app/QuickLogContext'

const items = [
  { to: '/', label: 'Today', icon: Home, end: true },
  { to: '/history', label: 'History', icon: CalendarDays, end: false },
] as const

const itemsRight = [
  { to: '/trends', label: 'Trends', icon: LineChart, end: false },
  { to: '/profile', label: 'Profile', icon: User, end: false },
] as const

export function BottomNav() {
  const { openCreate } = useQuickLog()

  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur sm:hidden"
      aria-label="Primary"
    >
      <div className="relative flex items-stretch justify-between px-2">
        {items.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        <div className="flex w-16 shrink-0 items-center justify-center">
          <button
            onClick={() => openCreate()}
            aria-label="Log something"
            className="tap-target -mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-600)] text-white shadow-lg shadow-[var(--color-brand-600)]/30 transition-transform active:scale-95"
          >
            <Plus size={26} />
          </button>
        </div>

        {itemsRight.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </div>
    </nav>
  )
}

function NavItem({ to, label, icon: Icon, end }: { to: string; label: string; icon: typeof Home; end: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        clsx(
          'tap-target flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors',
          isActive ? 'text-[var(--color-brand-600)]' : 'text-[var(--color-ink-faint)]',
        )
      }
    >
      <Icon size={22} strokeWidth={2} />
      {label}
    </NavLink>
  )
}
