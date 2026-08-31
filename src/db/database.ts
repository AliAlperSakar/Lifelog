import Dexie, { type EntityTable } from 'dexie'
import type { AppSettings, Goal, LogEntry, UserProfile } from '../domain/types'

/**
 * Single, explicit database module. Nothing outside `src/db` and
 * `src/repositories` talks to Dexie directly — screens and components go
 * through repositories only (see src/repositories).
 *
 * Versioning: bump `.version(n)` and add an `.upgrade()` migration whenever
 * the schema changes. Never drop or rename a store in a way that discards
 * existing user data without an explicit migration step.
 */
export class LifeLogDatabase extends Dexie {
  entries!: EntityTable<LogEntry, 'id'>
  profile!: EntityTable<UserProfile, 'id'>
  goals!: EntityTable<Goal, 'id'>
  settings!: EntityTable<AppSettings, 'id'>

  constructor() {
    super('lifelog-db')

    this.version(1).stores({
      // Compound/multi indexes chosen for the queries the app actually runs:
      // "today's entries" (localDate), "history for a range" (localDate),
      // "entries of a category" (category), plus createdAt for stable
      // ordering and timestamp for chronological display within a day.
      entries: 'id, localDate, category, [localDate+category], timestamp, createdAt, updatedAt',
      profile: 'id',
      goals: 'id, type, active',
      settings: 'id',
    })
  }
}

export const db = new LifeLogDatabase()
