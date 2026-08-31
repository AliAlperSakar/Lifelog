import { describe, expect, it } from 'vitest'
import { localDateFromTimestamp, minutesBetween } from './date'

describe('localDateFromTimestamp', () => {
  it('keeps a late-night entry on its own local calendar day', () => {
    expect(localDateFromTimestamp('2026-08-31T00:30:00-05:00')).toBe('2026-08-31')
  })

  it('does not shift the date when the recorded offset differs from the runtime timezone', () => {
    // 00:30 local time at UTC+09:00 is 15:30 the PREVIOUS day in UTC. A
    // naive `new Date(ts).toISOString().slice(0,10)` (or a parseISO+format
    // round trip evaluated in a UTC test runner) would misreport this as
    // 2026-08-30. The entry must stay on 2026-08-31, the day it was
    // actually logged on the device.
    expect(localDateFromTimestamp('2026-08-31T00:30:00+09:00')).toBe('2026-08-31')
  })
})

describe('minutesBetween', () => {
  it('handles sleep spanning midnight', () => {
    const mins = minutesBetween('2026-08-30T23:30:00+02:00', '2026-08-31T07:30:00+02:00')
    expect(mins).toBe(480)
  })
})
