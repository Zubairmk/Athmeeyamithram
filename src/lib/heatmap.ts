import { toDateString } from './date'
import type { DailyProgress } from '../types/dhikr'

export type DayStatus = 'both' | 'one' | 'none' | 'future'

export interface HeatmapDay {
  date: string
  status: DayStatus
}

// Builds a rectangular grid (weeks x 7) of the last `weeks` weeks ending
// today, aligned to full calendar weeks starting Sunday, for a simple
// GitHub-style completion heatmap.
export function buildHeatmapWeeks(records: DailyProgress[], weeks = 10): HeatmapDay[][] {
  const byDate = new Map(records.map((r) => [r.date, r]))
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const end = new Date(today)
  end.setDate(end.getDate() + (6 - end.getDay())) // end of this week (Saturday)
  const start = new Date(end)
  start.setDate(start.getDate() - (weeks * 7 - 1))

  const days: HeatmapDay[] = []
  const cursor = new Date(start)
  while (cursor <= end) {
    const dateStr = toDateString(cursor)
    let status: DayStatus
    if (cursor > today) {
      status = 'future'
    } else {
      const record = byDate.get(dateStr)
      status = record?.morning_completed && record?.evening_completed
        ? 'both'
        : record?.morning_completed || record?.evening_completed
          ? 'one'
          : 'none'
    }
    days.push({ date: dateStr, status })
    cursor.setDate(cursor.getDate() + 1)
  }

  const weekRows: HeatmapDay[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weekRows.push(days.slice(i, i + 7))
  }
  return weekRows
}
