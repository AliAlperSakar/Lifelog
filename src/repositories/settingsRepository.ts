import { db } from '../db/database'
import type { AppSettings } from '../domain/types'
import { nowIso } from '../utils/date'

const DEFAULT_SETTINGS: AppSettings = {
  id: 'app',
  theme: 'system',
  demoDataSeeded: false,
  onboardingSeen: false,
  updatedAt: nowIso(),
}

async function get(): Promise<AppSettings> {
  const existing = await db.settings.get('app')
  if (existing) return existing
  await db.settings.put(DEFAULT_SETTINGS)
  return DEFAULT_SETTINGS
}

async function update(changes: Partial<AppSettings>): Promise<AppSettings> {
  const current = await get()
  const next: AppSettings = { ...current, ...changes, id: 'app', updatedAt: nowIso() }
  await db.settings.put(next)
  return next
}

export const settingsRepository = { get, update, DEFAULT_SETTINGS }
