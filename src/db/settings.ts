import { getDB } from './database'
import type { AppSettings } from '../types/dhikr'

const SETTINGS_ID = 'app-settings'

const DEFAULT_SETTINGS: AppSettings = {
  id: SETTINGS_ID,
  reminders: {
    morning: { enabled: false, time: '05:30' },
    evening: { enabled: false, time: '18:00' },
  },
}

export async function getSettings(): Promise<AppSettings> {
  const db = await getDB()
  const settings = await db.get('settings', SETTINGS_ID)
  return settings ?? DEFAULT_SETTINGS
}

export async function putSettings(settings: AppSettings): Promise<void> {
  const db = await getDB()
  await db.put('settings', settings)
}
