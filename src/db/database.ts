import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { AppSettings, DailyProgress, DhikrItem, DhikrSet } from '../types/dhikr'

const DB_NAME = 'athmeeyamithram'
const DB_VERSION = 2

export interface AudioBlobRecord {
  file: string // matches DhikrItemAudio.file, primary key
  blob: Blob
}

export interface PdfBlobRecord {
  file: string // matches DhikrItem.pdf_file, primary key
  blob: Blob
}

interface AthmeeyamithramDB extends DBSchema {
  sets: {
    key: string
    value: DhikrSet
    indexes: { 'by-order': number }
  }
  items: {
    key: string
    value: DhikrItem
    indexes: { 'by-set': string }
  }
  audio_blobs: {
    key: string
    value: AudioBlobRecord
  }
  pdf_blobs: {
    key: string
    value: PdfBlobRecord
  }
  daily_progress: {
    key: string // date
    value: DailyProgress
  }
  settings: {
    key: string
    value: AppSettings
  }
}

let dbPromise: Promise<IDBPDatabase<AthmeeyamithramDB>> | null = null

export function getDB(): Promise<IDBPDatabase<AthmeeyamithramDB>> {
  if (!dbPromise) {
    dbPromise = openDB<AthmeeyamithramDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('sets')) {
          const sets = db.createObjectStore('sets', { keyPath: 'id' })
          sets.createIndex('by-order', 'order')
        }
        if (!db.objectStoreNames.contains('items')) {
          const items = db.createObjectStore('items', { keyPath: 'id' })
          items.createIndex('by-set', 'set_id')
        }
        if (!db.objectStoreNames.contains('audio_blobs')) {
          db.createObjectStore('audio_blobs', { keyPath: 'file' })
        }
        if (!db.objectStoreNames.contains('pdf_blobs')) {
          db.createObjectStore('pdf_blobs', { keyPath: 'file' })
        }
        if (!db.objectStoreNames.contains('daily_progress')) {
          db.createObjectStore('daily_progress', { keyPath: 'date' })
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}
