import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { IconButton } from './IconButton'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}

/** A bottom sheet on narrow viewports, a centered dialog on wide ones — one
 * component, CSS handles the layout switch. Deliberately dependency-free
 * (no headless-UI/radix) to keep the bundle small; implements the basics of
 * an accessible dialog: role, labelling, Escape-to-close, backdrop click,
 * and returning focus to the trigger on close. */
export function Sheet({ open, onClose, title, children, footer }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    previousFocus.current = document.activeElement as HTMLElement | null
    const first = panelRef.current?.querySelector<HTMLElement>('input, select, textarea, button:not([data-close])')
    first?.focus()
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      previousFocus.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="safe-bottom relative flex max-h-[90dvh] w-full flex-col rounded-t-2xl bg-[var(--color-surface)] sm:max-h-[85dvh] sm:w-[480px] sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <h2 className="text-base font-semibold text-[var(--color-ink)]">{title}</h2>
          <IconButton aria-label="Close" data-close onClick={onClose}>
            <X size={20} />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer && <div className="safe-bottom shrink-0 border-t border-[var(--color-border)] px-4 py-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
