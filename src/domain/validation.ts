import { z } from 'zod'
import { BACKUP_SCHEMA_VERSION, CATEGORIES } from './types'

/** Zod schemas used to validate imported backup files. Deliberately a bit
 * looser than the full TypeScript union (e.g. `detail` is a passthrough
 * record) — the goal is to reject corrupt/foreign JSON, not to re-implement
 * exhaustive per-category validation twice. */

const provenanceSchema = z.object({
  source: z.enum(['manual', 'label', 'database', 'ai', 'calculated', 'device', 'demo']).optional(),
  measurementStatus: z.enum(['exact', 'approximate']).optional(),
  confidence: z.enum(['low', 'medium', 'high']).optional(),
})

export const logEntrySchema = z
  .object({
    id: z.string().min(1),
    timestamp: z.string().min(1),
    localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'localDate must be YYYY-MM-DD'),
    category: z.enum(CATEGORIES),
    subtype: z.string().optional(),
    title: z.string().optional(),
    notes: z.string().optional(),
    detail: z.record(z.string(), z.unknown()),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
    isDemo: z.boolean().optional(),
  })
  .merge(provenanceSchema)

export const goalSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  active: z.boolean(),
  targetMetric: z.string().optional(),
  targetValue: z.number().optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

export const profileSchema = z.object({
  id: z.literal('profile'),
  heightCm: z.number().optional(),
  heightApproximate: z.boolean().optional(),
  seedWeightKg: z.number().optional(),
  seedWeightApproximate: z.boolean().optional(),
  age: z.number().optional(),
  sex: z.string().optional(),
  activityLevel: z.string().optional(),
  updatedAt: z.string().min(1),
})

export const settingsSchema = z.object({
  id: z.literal('app'),
  theme: z.enum(['system', 'light', 'dark']),
  demoDataSeeded: z.boolean(),
  onboardingSeen: z.boolean(),
  updatedAt: z.string().min(1),
})

export const backupEnvelopeSchema = z.object({
  schema: z.literal('lifelog-backup'),
  schemaVersion: z.number().int().min(1).max(BACKUP_SCHEMA_VERSION),
  exportedAt: z.string().min(1),
  appVersion: z.string(),
  profile: profileSchema.nullable(),
  settings: settingsSchema.nullable(),
  goals: z.array(goalSchema),
  entries: z.array(logEntrySchema),
})

export type ValidatedBackup = z.infer<typeof backupEnvelopeSchema>

// --- Numeric field guards used by forms --------------------------------

export const nonNegativeNumber = z
  .number({ error: 'Must be a number' })
  .refine((v) => Number.isFinite(v), 'Must be a valid number')
  .refine((v) => v >= 0, 'Cannot be negative')

export const optionalNonNegativeNumber = z.union([nonNegativeNumber, z.undefined(), z.nan().transform(() => undefined)])
