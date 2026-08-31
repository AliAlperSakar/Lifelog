import { createContext, useContext, useEffect, type ReactNode } from 'react'
import type { ThemePreference } from '../domain/types'
import { settingsRepository } from '../repositories/settingsRepository'
import { useSettings } from '../hooks/useProfile'

interface ThemeContextValue {
  theme: ThemePreference
  setTheme: (t: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'system', setTheme: () => {} })

export function useTheme() {
  return useContext(ThemeContext)
}

function applyTheme(theme: ThemePreference) {
  const root = document.documentElement
  if (theme === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', theme)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const settings = useSettings()
  // The DB-persisted preference IS the source of truth — no separate local
  // copy to keep in sync. `settings` starts undefined until the first live
  // query resolves, so default to 'system' for that first render.
  const theme = settings?.theme ?? 'system'

  // Applying the theme is a genuine external-system sync (a DOM attribute
  // read by CSS), so it stays in an effect — unlike mirroring `settings`
  // into component state, which would just be a redundant setState.
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const setTheme = (t: ThemePreference) => {
    applyTheme(t)
    void settingsRepository.update({ theme: t })
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}
