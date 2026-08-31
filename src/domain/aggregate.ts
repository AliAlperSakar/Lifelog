import type { MeasurementStatus } from './types'

/**
 * The result of summing an optional numeric field across a set of entries.
 * `undefined` (the field is simply absent from the return type at the call
 * site) means "not logged" — callers must not coerce that to 0. When this
 * type IS present, `value` may legitimately be 0 (an explicit zero the user
 * recorded, e.g. "0 cigarettes today").
 */
export interface Aggregate {
  value: number
  /** True if at least one contributing entry was approximate. */
  approximate: boolean
  /** Number of entries that contributed a defined value. */
  entryCount: number
}

interface Contribution {
  value: number | undefined
  approximate?: boolean
}

/**
 * Sums a field across entries while preserving missing-data semantics.
 * Returns undefined when nothing in `contributions` had a defined value —
 * this is what lets the UI show "Not logged" instead of a false zero.
 */
export function sumContributions(contributions: Contribution[]): Aggregate | undefined {
  const defined = contributions.filter((c): c is { value: number; approximate?: boolean } => c.value !== undefined)
  if (defined.length === 0) return undefined
  return {
    value: defined.reduce((acc, c) => acc + c.value, 0),
    approximate: defined.some((c) => c.approximate === true),
    entryCount: defined.length,
  }
}

export function averageContributions(contributions: Contribution[]): Aggregate | undefined {
  const defined = contributions.filter((c): c is { value: number; approximate?: boolean } => c.value !== undefined)
  if (defined.length === 0) return undefined
  return {
    value: defined.reduce((acc, c) => acc + c.value, 0) / defined.length,
    approximate: defined.some((c) => c.approximate === true),
    entryCount: defined.length,
  }
}

export function statusIsApprox(status: MeasurementStatus | undefined): boolean {
  return status === 'approximate'
}
