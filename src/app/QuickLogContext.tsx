import { createContext, useContext, useState, type ReactNode } from 'react'
import type { LogCategory, LogEntry } from '../domain/types'

interface QuickLogState {
  open: boolean
  /** When editing, the entry being edited; undefined means "create new". */
  editingEntry?: LogEntry
  /** Pre-selected category when opened from a category-specific shortcut. */
  initialCategory?: LogCategory
}

interface QuickLogContextValue extends QuickLogState {
  openCreate: (category?: LogCategory) => void
  openEdit: (entry: LogEntry) => void
  close: () => void
}

const QuickLogContext = createContext<QuickLogContextValue | undefined>(undefined)

export function QuickLogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<QuickLogState>({ open: false })

  const value: QuickLogContextValue = {
    ...state,
    openCreate: (category) => setState({ open: true, initialCategory: category, editingEntry: undefined }),
    openEdit: (entry) => setState({ open: true, editingEntry: entry, initialCategory: entry.category }),
    close: () => setState({ open: false }),
  }

  return <QuickLogContext.Provider value={value}>{children}</QuickLogContext.Provider>
}

export function useQuickLog() {
  const ctx = useContext(QuickLogContext)
  if (!ctx) throw new Error('useQuickLog must be used within QuickLogProvider')
  return ctx
}
