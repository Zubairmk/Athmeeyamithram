export type SetCategory = 'time' | 'occasion'

export interface DhikrSet {
  id: string
  slug: string
  title_ml: string
  title_en: string
  category: SetCategory
  order: number
  icon: string
  created_at: string
  updated_at: string
}

export interface DhikrItemAudio {
  file: string
  duration_sec?: number
}

export interface DhikrItem {
  id: string
  set_id: string
  order: number
  pdf_file: string // key into the pdf_blobs store — the source PDF, shown as-is
  pdf_file_name: string // original filename, for admin reference
  audio: DhikrItemAudio
  created_at: string
  updated_at: string
}

export interface DailyProgress {
  date: string // YYYY-MM-DD
  morning_completed: boolean
  evening_completed: boolean
  occasion_sets_viewed: string[]
}

export interface ReminderConfig {
  enabled: boolean
  time: string // HH:MM, 24h
}

export interface AppSettings {
  id: 'app-settings'
  reminders: {
    morning: ReminderConfig
    evening: ReminderConfig
  }
}
