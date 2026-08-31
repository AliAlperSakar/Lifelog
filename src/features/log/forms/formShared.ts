import type { DistributiveOmit, LogEntry } from '../../../domain/types'
import { nowIso } from '../../../utils/date'

export type NewEntryPayload = DistributiveOmit<LogEntry, 'id' | 'localDate' | 'createdAt' | 'updatedAt'>

export type QuickLogSubmit = (data: NewEntryPayload) => void

export interface FormProps<E extends LogEntry> {
  entry?: E
  defaultSubtype?: string
  formId: string
  onSubmit: QuickLogSubmit
}

/** Parses a text input as an optional non-negative number. Empty string ->
 * undefined (field left blank = not entered, never coerced to 0). Invalid
 * text -> undefined as well, so a stray character can't silently become 0
 * either — the field just stays unset until the user fixes it. */
export function parseOptionalNumber(raw: string): number | undefined {
  if (raw.trim() === '') return undefined
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0) return undefined
  return n
}

export function defaultTimestamp(): string {
  return nowIso()
}
