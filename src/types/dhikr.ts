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

export type ExtractionMethod = 'text-layer' | 'ocr'
export type ExtractionConfidence = 'high' | 'low'

export interface DhikrItemSource {
  pdf_file: string
  extraction_method: ExtractionMethod
  confidence: ExtractionConfidence
  needs_review: boolean
}

export interface DhikrItemAudio {
  file: string
  duration_sec?: number
}

export interface DhikrItem {
  id: string
  set_id: string
  order: number
  arabic_text: string
  malayalam_text?: string
  audio: DhikrItemAudio
  source: DhikrItemSource
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
