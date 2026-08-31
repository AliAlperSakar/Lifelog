import { useRef, useState } from 'react'
import { Download, Upload, RotateCcw, Trash2, Smartphone, Moon, Sun, MonitorSmartphone } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { useTheme } from '../../app/ThemeProvider'
import { exportBackupToFile, parseBackupJson, importBackup, BackupValidationError, type ImportPreview } from '../../services/backup'
import { logEntryRepository } from '../../repositories/logEntryRepository'
import { settingsRepository } from '../../repositories/settingsRepository'
import type { BackupEnvelope } from '../../domain/types'
import { db } from '../../db/database'

export function SettingsScreen() {
  const { theme, setTheme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [pendingBackup, setPendingBackup] = useState<BackupEnvelope | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [strategy, setStrategy] = useState<'replace' | 'merge'>('merge')

  const [confirmingReset, setConfirmingReset] = useState(false)
  const [confirmingDeleteAll, setConfirmingDeleteAll] = useState(false)
  const [confirmingImport, setConfirmingImport] = useState(false)

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setImportError(null)
    try {
      const text = await file.text()
      const { backup, preview } = parseBackupJson(text)
      setPendingBackup(backup)
      setPreview(preview)
      setConfirmingImport(false)
    } catch (err) {
      setImportError(err instanceof BackupValidationError ? err.message : 'Could not read this file.')
    }
  }

  async function handleConfirmImport() {
    if (!pendingBackup) return
    if (!confirmingImport) {
      setConfirmingImport(true)
      return
    }
    await importBackup(pendingBackup, strategy)
    setPendingBackup(null)
    setPreview(null)
    setConfirmingImport(false)
  }

  async function handleResetDemo() {
    if (!confirmingReset) {
      setConfirmingReset(true)
      return
    }
    await logEntryRepository.deleteAllDemoData()
    setConfirmingReset(false)
  }

  async function handleDeleteAll() {
    if (!confirmingDeleteAll) {
      setConfirmingDeleteAll(true)
      return
    }
    await db.transaction('rw', db.entries, db.goals, db.profile, db.settings, async () => {
      await db.entries.clear()
      await db.goals.clear()
      await db.profile.clear()
      await db.settings.clear()
    })
    await settingsRepository.update({ demoDataSeeded: true }) // don't reseed demo data after an intentional wipe
    setConfirmingDeleteAll(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-[var(--color-ink)]">Settings</h1>

      <Card className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-[var(--color-ink)]">Appearance</h2>
        <SegmentedControl
          value={theme}
          onChange={setTheme}
          options={[
            { value: 'system', label: 'System' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
        />
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-[var(--color-ink)]">Your data</h2>
        <p className="text-sm text-[var(--color-ink-soft)]">
          Everything you log is stored only in this browser, on this device. Nothing is sent to a server. Export a backup regularly, especially before clearing
          browser data.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => void exportBackupToFile()}>
            <Download size={16} /> Export backup (JSON)
          </Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} /> Import backup
          </Button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={(e) => void handleFileSelected(e)} />
        </div>
        {importError && <p className="text-sm text-[var(--color-alert)]">{importError}</p>}

        {preview && (
          <div className="mt-2 flex flex-col gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] p-3">
            <p className="text-sm text-[var(--color-ink)]">
              This backup has <strong>{preview.entryCount}</strong> entries
              {preview.dateRange && (
                <>
                  {' '}
                  from {preview.dateRange.start} to {preview.dateRange.end}
                </>
              )}
              , exported {new Date(preview.exportedAt).toLocaleString()}.
            </p>
            <SegmentedControl
              value={strategy}
              onChange={setStrategy}
              options={[
                { value: 'merge', label: 'Merge' },
                { value: 'replace', label: 'Replace all' },
              ]}
            />
            <p className="text-xs text-[var(--color-ink-faint)]">
              {strategy === 'merge'
                ? 'Adds/updates entries from the backup; anything else already on this device is kept.'
                : 'Deletes everything currently on this device first, then restores exactly what is in the backup.'}
            </p>
            <div className="flex gap-2">
              <Button variant={confirmingImport ? 'danger' : 'primary'} onClick={() => void handleConfirmImport()}>
                {confirmingImport ? 'Tap again to confirm import' : 'Import'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setPendingBackup(null)
                  setPreview(null)
                  setConfirmingImport(false)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-[var(--color-ink)]">Install as an app</h2>
        <div className="flex items-start gap-3 text-sm text-[var(--color-ink-soft)]">
          <Smartphone size={18} className="mt-0.5 shrink-0" />
          <p>
            On iPhone: open this page in Safari, tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>. On Android/desktop Chrome or Edge, look
            for an <strong>Install</strong> icon in the address bar.
          </p>
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-[var(--color-ink)]">Reset</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => void handleResetDemo()}>
            <RotateCcw size={16} /> {confirmingReset ? 'Tap again to confirm' : 'Remove demo data'}
          </Button>
          <Button variant="danger" onClick={() => void handleDeleteAll()}>
            <Trash2 size={16} /> {confirmingDeleteAll ? 'Tap again to permanently delete everything' : 'Delete all local data'}
          </Button>
        </div>
      </Card>

      <p className="flex items-center gap-1.5 text-xs text-[var(--color-ink-faint)]">
        {theme === 'dark' ? <Moon size={13} /> : theme === 'light' ? <Sun size={13} /> : <MonitorSmartphone size={13} />}
        LifeLog v1.0.0 — local-first, offline-first, no account.
      </p>
    </div>
  )
}
