import { v4 as uuid } from 'uuid'
import { db } from '../db/database'
import type { DistributiveOmit, LogEntry } from '../domain/types'
import { localDateFromTimestamp, nowIso } from '../utils/date'

export type NewLogEntry = DistributiveOmit<LogEntry, 'id' | 'localDate' | 'createdAt' | 'updatedAt'> & {
  localDate?: string
}

async function create(input: NewLogEntry): Promise<LogEntry> {
  const now = nowIso()
  const entry = {
    ...input,
    id: uuid(),
    localDate: input.localDate ?? localDateFromTimestamp(input.timestamp),
    createdAt: now,
    updatedAt: now,
  } as LogEntry
  await db.entries.add(entry)
  return entry
}

/** Accepts the same "full variant minus generated fields" shape as
 * `create` — quick-log forms always resubmit the whole category payload on
 * edit, not a sparse patch, which keeps this type-safe across the
 * discriminated union (see DistributiveOmit). */
async function update(id: string, changes: NewLogEntry): Promise<void> {
  const patch = {
    ...changes,
    localDate: changes.localDate ?? localDateFromTimestamp(changes.timestamp),
    updatedAt: nowIso(),
  }
  await db.entries.update(id, patch as Partial<LogEntry>)
}

async function remove(id: string): Promise<void> {
  await db.entries.delete(id)
}

async function getById(id: string): Promise<LogEntry | undefined> {
  return db.entries.get(id)
}

async function getForDate(localDate: string): Promise<LogEntry[]> {
  const rows = await db.entries.where('localDate').equals(localDate).toArray()
  return rows.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

async function getBetweenDates(startLocalDate: string, endLocalDate: string): Promise<LogEntry[]> {
  const rows = await db.entries.where('localDate').between(startLocalDate, endLocalDate, true, true).toArray()
  return rows.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

async function getAll(): Promise<LogEntry[]> {
  return db.entries.toArray()
}

async function getDatesWithData(startLocalDate: string, endLocalDate: string): Promise<Set<string>> {
  const rows = await db.entries
    .where('localDate')
    .between(startLocalDate, endLocalDate, true, true)
    .toArray()
  return new Set(rows.map((r) => r.localDate))
}

async function bulkPut(entries: LogEntry[]): Promise<void> {
  await db.entries.bulkPut(entries)
}

async function deleteAllDemoData(): Promise<void> {
  const demoIds = await db.entries.filter((e) => e.isDemo === true).primaryKeys()
  await db.entries.bulkDelete(demoIds)
}

async function deleteAll(): Promise<void> {
  await db.entries.clear()
}

async function count(): Promise<number> {
  return db.entries.count()
}

export const logEntryRepository = {
  create,
  update,
  remove,
  getById,
  getForDate,
  getBetweenDates,
  getAll,
  getDatesWithData,
  bulkPut,
  deleteAllDemoData,
  deleteAll,
  count,
}
