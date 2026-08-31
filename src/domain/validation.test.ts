import { describe, expect, it } from 'vitest'
import { parseBackupJson, BackupValidationError } from '../services/backup'

describe('parseBackupJson', () => {
  it('rejects malformed JSON', () => {
    expect(() => parseBackupJson('{not json')).toThrow(BackupValidationError)
  })

  it('rejects JSON that does not match the backup schema', () => {
    expect(() => parseBackupJson(JSON.stringify({ foo: 'bar' }))).toThrow(BackupValidationError)
  })

  it('rejects an entry with an invalid localDate', () => {
    const bad = {
      schema: 'lifelog-backup',
      schemaVersion: 1,
      exportedAt: '2026-08-31T00:00:00Z',
      appVersion: '1.0.0',
      profile: null,
      settings: null,
      goals: [],
      entries: [
        {
          id: 'e1',
          timestamp: '2026-08-31T00:00:00Z',
          localDate: 'not-a-date',
          category: 'food',
          detail: {},
          createdAt: 't',
          updatedAt: 't',
        },
      ],
    }
    expect(() => parseBackupJson(JSON.stringify(bad))).toThrow(BackupValidationError)
  })

  it('accepts a well-formed backup and produces a preview summary', () => {
    const good = {
      schema: 'lifelog-backup',
      schemaVersion: 1,
      exportedAt: '2026-08-31T00:00:00+02:00',
      appVersion: '1.0.0',
      profile: null,
      settings: null,
      goals: [],
      entries: [
        {
          id: 'e1',
          timestamp: '2026-08-31T09:00:00+02:00',
          localDate: '2026-08-31',
          category: 'water',
          detail: { volumeMl: 250 },
          createdAt: 't',
          updatedAt: 't',
        },
      ],
    }
    const { preview } = parseBackupJson(JSON.stringify(good))
    expect(preview.entryCount).toBe(1)
    expect(preview.dateRange).toEqual({ start: '2026-08-31', end: '2026-08-31' })
  })
})
