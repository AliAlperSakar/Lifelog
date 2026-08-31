import { db } from '../db/database'
import { BACKUP_SCHEMA_VERSION, type BackupEnvelope } from '../domain/types'
import { backupEnvelopeSchema } from '../domain/validation'
import { logEntryRepository } from '../repositories/logEntryRepository'
import { profileRepository } from '../repositories/profileRepository'
import { settingsRepository } from '../repositories/settingsRepository'
import { goalRepository } from '../repositories/goalRepository'
import { nowIso } from '../utils/date'

const APP_VERSION = '1.0.0'

export async function buildBackup(): Promise<BackupEnvelope> {
  const [entries, profile, settings, goals] = await Promise.all([
    logEntryRepository.getAll(),
    profileRepository.get(),
    settingsRepository.get(),
    goalRepository.getAll(),
  ])
  return {
    schema: 'lifelog-backup',
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: nowIso(),
    appVersion: APP_VERSION,
    profile,
    settings,
    goals,
    entries,
  }
}

export async function exportBackupToFile(): Promise<void> {
  const backup = await buildBackup()
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const stamp = backup.exportedAt.slice(0, 10)
  a.href = url
  a.download = `lifelog-backup-${stamp}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export interface ImportPreview {
  entryCount: number
  goalCount: number
  hasProfile: boolean
  hasSettings: boolean
  exportedAt: string
  dateRange?: { start: string; end: string }
}

export interface ParsedImport {
  backup: import('../domain/types').BackupEnvelope
  preview: ImportPreview
}

export class BackupValidationError extends Error {}

export function parseBackupJson(text: string): ParsedImport {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new BackupValidationError('This file is not valid JSON.')
  }
  const result = backupEnvelopeSchema.safeParse(raw)
  if (!result.success) {
    throw new BackupValidationError('This file does not look like a LifeLog backup (schema mismatch).')
  }
  const backup = result.data as unknown as import('../domain/types').BackupEnvelope
  const dates = backup.entries.map((e) => e.localDate).sort()
  return {
    backup,
    preview: {
      entryCount: backup.entries.length,
      goalCount: backup.goals.length,
      hasProfile: backup.profile !== null,
      hasSettings: backup.settings !== null,
      exportedAt: backup.exportedAt,
      dateRange: dates.length > 0 ? { start: dates[0], end: dates[dates.length - 1] } : undefined,
    },
  }
}

export type ImportStrategy = 'replace' | 'merge'

/** Replace: wipes all local data first, then writes the backup verbatim.
 *  Merge: upserts by id (bulkPut) — entries from the backup overwrite an
 *  existing entry of the same id, everything else already on the device is
 *  left untouched. Either way, nothing is imported without the caller
 *  having shown a confirmation first (see Settings screen). */
export async function importBackup(backup: BackupEnvelope, strategy: ImportStrategy): Promise<void> {
  await db.transaction('rw', db.entries, db.profile, db.settings, db.goals, async () => {
    if (strategy === 'replace') {
      await db.entries.clear()
      await db.goals.clear()
    }
    await db.entries.bulkPut(backup.entries)
    for (const g of backup.goals) await db.goals.put(g)
    if (backup.profile) await db.profile.put(backup.profile)
    if (backup.settings) await db.settings.put(backup.settings)
  })
}
