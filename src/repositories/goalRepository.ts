import { v4 as uuid } from 'uuid'
import { db } from '../db/database'
import type { Goal } from '../domain/types'
import { nowIso } from '../utils/date'

async function getAll(): Promise<Goal[]> {
  return db.goals.toArray()
}

async function getActive(): Promise<Goal[]> {
  const all = await db.goals.toArray()
  return all.filter((g) => g.active)
}

async function create(input: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
  const now = nowIso()
  const goal: Goal = { ...input, id: uuid(), createdAt: now, updatedAt: now }
  await db.goals.add(goal)
  return goal
}

async function update(id: string, changes: Partial<Goal>): Promise<void> {
  await db.goals.update(id, { ...changes, updatedAt: nowIso() })
}

async function remove(id: string): Promise<void> {
  await db.goals.delete(id)
}

export const goalRepository = { getAll, getActive, create, update, remove }
