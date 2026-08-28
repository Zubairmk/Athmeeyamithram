import { toDateString } from './date'
import type { DailyProgress } from '../types/dhikr'

// Current streak = consecutive days, walking backward from today, where
// both Morning and Evening were completed. Today is allowed to still be
// in progress without breaking the streak (the day isn't over yet) — it
// only counts toward the streak once it's actually complete.
export function computeCurrentStreak(records: DailyProgress[]): number {
  const byDate = new Map(records.map((r) => [r.date, r]))
  const isComplete = (date: string) => {
    const r = byDate.get(date)
    return !!r?.morning_completed && !!r?.evening_completed
  }

  const cursor = new Date()
  if (!isComplete(toDateString(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }

  let streak = 0
  while (isComplete(toDateString(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
