import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../db/database'
import { logEntryRepository } from '../repositories/logEntryRepository'
import { buildBackup } from './backup'
import { BACKUP_SCHEMA_VERSION } from '../domain/types'

beforeEach(async () => {
  await db.entries.clear()
  await db.goals.clear()
  await db.profile.clear()
  await db.settings.clear()
})

describe('buildBackup', () => {
  it('includes required schema metadata', async () => {
    await logEntryRepository.create({
      category: 'water',
      timestamp: '2026-08-31T09:00:00+02:00',
      detail: { volumeMl: 250 },
    })
    const backup = await buildBackup()
    expect(backup.schema).toBe('lifelog-backup')
    expect(backup.schemaVersion).toBe(BACKUP_SCHEMA_VERSION)
    expect(backup.exportedAt).toBeTruthy()
    expect(backup.appVersion).toBeTruthy()
    expect(backup.entries).toHaveLength(1)
  })
})
