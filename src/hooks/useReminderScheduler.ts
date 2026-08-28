import { useEffect } from 'react'
import { getSettings } from '../db/settings'
import { getProgress } from '../db/progress'
import { todayDateString } from '../lib/date'
import { showReminderNotification } from '../lib/notifications'

const CHECK_INTERVAL_MS = 60_000
const LAST_NOTIFIED_KEY_PREFIX = 'athmeeyamithram:last-notified:'

function alreadyNotifiedToday(reminder: 'morning' | 'evening'): boolean {
  try {
    return localStorage.getItem(LAST_NOTIFIED_KEY_PREFIX + reminder) === todayDateString()
  } catch {
    return false
  }
}

function markNotifiedToday(reminder: 'morning' | 'evening'): void {
  try {
    localStorage.setItem(LAST_NOTIFIED_KEY_PREFIX + reminder, todayDateString())
  } catch {
    // localStorage unavailable (private browsing, etc.) — reminder will just
    // re-fire on the next check, which is a harmless duplicate at worst.
  }
}

function isPastTime(hhmm: string): boolean {
  const [hours, minutes] = hhmm.split(':').map(Number)
  const now = new Date()
  return now.getHours() > hours || (now.getHours() === hours && now.getMinutes() >= minutes)
}

// Best-effort reminder notifications: this is a fully local, no-login PWA
// with no push server, so there is no way to wake a closed browser at an
// exact time — that would require Web Push + a backend. Instead, this
// checks once on load (to catch up if the app is opened after the reminder
// time) and then every minute while the app stays open in a tab, which is
// the standard approach for this kind of local-first app.
export function useReminderScheduler(): void {
  useEffect(() => {
    let cancelled = false

    async function check() {
      const [settings, todayProgress] = await Promise.all([
        getSettings(),
        getProgress(todayDateString()),
      ])
      if (cancelled) return

      const { morning, evening } = settings.reminders
      if (
        morning.enabled &&
        isPastTime(morning.time) &&
        !todayProgress?.morning_completed &&
        !alreadyNotifiedToday('morning')
      ) {
        markNotifiedToday('morning')
        showReminderNotification('Morning Azkar', 'Your morning azkar are waiting.')
      }
      if (
        evening.enabled &&
        isPastTime(evening.time) &&
        !todayProgress?.evening_completed &&
        !alreadyNotifiedToday('evening')
      ) {
        markNotifiedToday('evening')
        showReminderNotification('Evening Azkar', 'Your evening azkar are waiting.')
      }
    }

    check()
    const interval = setInterval(check, CHECK_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])
}
