import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { profileRepository } from '../repositories/profileRepository'
import { settingsRepository } from '../repositories/settingsRepository'

export function useProfile() {
  return useLiveQuery(async () => {
    const existing = await db.profile.get('profile')
    return existing ?? profileRepository.DEFAULT_PROFILE
  }, [])
}

export function useSettings() {
  return useLiveQuery(async () => {
    const existing = await db.settings.get('app')
    return existing ?? settingsRepository.DEFAULT_SETTINGS
  }, [])
}

export function useGoals() {
  return useLiveQuery(() => db.goals.toArray(), [])
}
