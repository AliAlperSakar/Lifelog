import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw, X } from 'lucide-react'

/** Subtle, non-blocking "a new version is ready" banner. Never interrupts
 * active logging — it just sits at the top until dismissed or reloaded. */
export function UpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError: () => {
      // Offline-first: registration can legitimately fail in dev or on
      // browsers without SW support. Nothing user-facing to do here.
    },
  })

  if (!needRefresh) return null

  return (
    <div className="safe-top flex items-center justify-between gap-3 bg-[var(--color-brand-600)] px-4 py-2 text-sm text-white">
      <span>Update available</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => void updateServiceWorker(true)}
          className="tap-target flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 font-medium hover:bg-white/25"
        >
          <RefreshCw size={14} /> Reload
        </button>
        <button onClick={() => setNeedRefresh(false)} aria-label="Dismiss" className="tap-target rounded-full p-1 hover:bg-white/15">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
