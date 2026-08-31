import { describe, expect, it } from 'vitest'
import { formatApprox, formatMl } from './format'

describe('formatApprox', () => {
  it('prefixes approximate values with ~', () => {
    expect(formatApprox(430, 'approximate')).toBe('~430')
  })

  it('does not prefix exact values with ~', () => {
    expect(formatApprox(431, 'exact')).toBe('431')
  })

  it('rounds to the requested decimal places', () => {
    expect(formatApprox(5.234, 'approximate', 1)).toBe('~5.2')
  })
})

describe('formatMl', () => {
  it('renders large volumes in liters', () => {
    expect(formatMl(1800)).toBe('1.8 L')
  })

  it('renders small volumes in ml', () => {
    expect(formatMl(250)).toBe('250 ml')
  })
})
