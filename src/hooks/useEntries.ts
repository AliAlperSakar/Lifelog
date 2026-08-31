import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { db } from '../db/database'
import type { LogEntry } from '../domain/types'
import { calculateDailySummary } from '../services/aggregation'
import { groupEntriesByDate } from '../services/trends'

export function useEntriesForDate(localDate: string): LogEntry[] | undefined {
  return useLiveQuery(async () => {
    const rows = await db.entries.where('localDate').equals(localDate).toArray()
    return rows.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  }, [localDate])
}

export function useDailySummary(localDate: string) {
  const entries = useEntriesForDate(localDate)
  return useMemo(() => (entries ? calculateDailySummary(entries) : undefined), [entries])
}

export function useEntriesBetween(startLocalDate: string, endLocalDate: string): LogEntry[] | undefined {
  return useLiveQuery(async () => {
    const rows = await db.entries.where('localDate').between(startLocalDate, endLocalDate, true, true).toArray()
    return rows.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  }, [startLocalDate, endLocalDate])
}

export function useEntriesByDateMap(startLocalDate: string, endLocalDate: string) {
  const entries = useEntriesBetween(startLocalDate, endLocalDate)
  return useMemo(() => (entries ? groupEntriesByDate(entries) : undefined), [entries])
}

export function useDatesWithData(startLocalDate: string, endLocalDate: string): Set<string> | undefined {
  return useLiveQuery(async () => {
    const rows = await db.entries.where('localDate').between(startLocalDate, endLocalDate, true, true).toArray()
    return new Set(rows.map((r) => r.localDate))
  }, [startLocalDate, endLocalDate])
}

export function useEntryCount(): number | undefined {
  return useLiveQuery(() => db.entries.count(), [])
}

export function useLatestWeightEntry() {
  return useLiveQuery(async () => {
    const rows = await db.entries.where('category').equals('weight').toArray()
    if (rows.length === 0) return undefined
    return rows.sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0]
  }, [])
}
