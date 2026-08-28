import { getDB } from './database'
import type { DhikrSet } from '../types/dhikr'

const now = () => new Date().toISOString()

const DEFAULT_SETS: Omit<DhikrSet, 'created_at' | 'updated_at'>[] = [
  { id: 'morning-azkar', slug: 'morning', title_ml: 'പ്രഭാത ദിക്ർ', title_en: 'Morning Azkar', category: 'time', order: 1, icon: 'sunrise' },
  { id: 'evening-azkar', slug: 'evening', title_ml: 'സായാഹ്ന ദിക്ർ', title_en: 'Evening Azkar', category: 'time', order: 2, icon: 'sunset' },
  { id: 'after-prayer', slug: 'after-prayer', title_ml: 'നമസ്കാര ശേഷമുള്ള ദിക്ർ', title_en: 'After Prayer', category: 'occasion', order: 3, icon: 'prayer-mat' },
  { id: 'before-sleep', slug: 'before-sleep', title_ml: 'ഉറങ്ങുന്നതിന് മുമ്പുള്ള ദിക്ർ', title_en: 'Before Sleep', category: 'occasion', order: 4, icon: 'crescent' },
  { id: 'distress', slug: 'distress', title_ml: 'വിഷമഘട്ടത്തിലെ ദിക്ർ', title_en: 'Distress', category: 'occasion', order: 5, icon: 'shield' },
  { id: 'travel', slug: 'travel', title_ml: 'യാത്രാ ദിക്ർ', title_en: 'Travel', category: 'occasion', order: 6, icon: 'compass' },
]

// Seeds the six default sets exactly once. Safe to call on every app start.
export async function seedDefaultSets(): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('sets', 'readwrite')
  const store = tx.objectStore('sets')
  const existingCount = await store.count()
  if (existingCount === 0) {
    const timestamp = now()
    for (const set of DEFAULT_SETS) {
      await store.put({ ...set, created_at: timestamp, updated_at: timestamp })
    }
  }
  await tx.done
}
