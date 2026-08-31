import { db } from '../db/database'
import type { UserProfile } from '../domain/types'
import { nowIso } from '../utils/date'

const DEFAULT_PROFILE: UserProfile = {
  id: 'profile',
  heightCm: 190,
  heightApproximate: false,
  seedWeightKg: 95,
  seedWeightApproximate: true,
  updatedAt: nowIso(),
}

async function get(): Promise<UserProfile> {
  const existing = await db.profile.get('profile')
  if (existing) return existing
  await db.profile.put(DEFAULT_PROFILE)
  return DEFAULT_PROFILE
}

async function update(changes: Partial<UserProfile>): Promise<UserProfile> {
  const current = await get()
  const next: UserProfile = { ...current, ...changes, id: 'profile', updatedAt: nowIso() }
  await db.profile.put(next)
  return next
}

export const profileRepository = { get, update, DEFAULT_PROFILE }
