import { db } from './database'
import { demoEntries } from './seed'
import { profileRepository } from '../repositories/profileRepository'
import { settingsRepository } from '../repositories/settingsRepository'

/** Runs once at app startup: makes sure the profile/settings singleton
 * records exist, and seeds the example day the very first time the app is
 * opened (never again after that, even if the user later deletes
 * everything — demoDataSeeded is a one-way flag). */
export async function ensureDatabaseReady(): Promise<void> {
  await profileRepository.get()
  const settings = await settingsRepository.get()

  if (!settings.demoDataSeeded) {
    await db.entries.bulkPut(demoEntries)
    await settingsRepository.update({ demoDataSeeded: true })
  }
}
