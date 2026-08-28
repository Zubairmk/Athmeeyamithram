import { getDB } from './database'
import type { DailyProgress } from '../types/dhikr'

export async function getProgress(date: string): Promise<DailyProgress | undefined> {
  const db = await getDB()
  return db.get('daily_progress', date)
}

export async function getAllProgress(): Promise<DailyProgress[]> {
  const db = await getDB()
  return db.getAll('daily_progress')
}

export async function putProgress(progress: DailyProgress): Promise<void> {
  const db = await getDB()
  await db.put('daily_progress', progress)
}
