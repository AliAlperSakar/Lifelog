import type { Confidence, MeasurementStatus } from '../domain/types'

/**
 * Central "avoid fake precision" formatting helpers. A value's
 * measurementStatus decides whether we prefix with "~" — the underlying
 * number is still stored precisely (so aggregation stays simple), but
 * presentation always communicates uncertainty.
 */

export function formatApprox(value: number, status: MeasurementStatus | undefined, decimals = 0): string {
  const rounded = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString()
  return status === 'approximate' ? `~${rounded}` : rounded
}

export function formatKcal(value: number, status: MeasurementStatus | undefined): string {
  return `${formatApprox(value, status)} kcal`
}

export function formatGrams(value: number, status: MeasurementStatus | undefined, decimals = 0): string {
  return `${formatApprox(value, status, decimals)} g`
}

export function formatMl(value: number): string {
  if (value >= 1000) {
    const l = value / 1000
    return `${l % 1 === 0 ? l.toFixed(0) : l.toFixed(1)} L`
  }
  return `${Math.round(value)} ml`
}

export function confidenceLabel(c: Confidence): string {
  return { low: 'Low confidence', medium: 'Medium confidence', high: 'High confidence' }[c]
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? singular : plural
}

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}
