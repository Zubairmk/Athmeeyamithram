import { getDB } from './database'
import type { DhikrItem } from '../types/dhikr'

export async function getItemsForSet(setId: string): Promise<DhikrItem[]> {
  const db = await getDB()
  const items = await db.getAllFromIndex('items', 'by-set', setId)
  return items.sort((a, b) => a.order - b.order)
}

export async function getItem(id: string): Promise<DhikrItem | undefined> {
  const db = await getDB()
  return db.get('items', id)
}

export async function putItem(item: DhikrItem): Promise<void> {
  const db = await getDB()
  await db.put('items', item)
}

export async function deleteItem(id: string): Promise<void> {
  const db = await getDB()
  const item = await db.get('items', id)
  await db.delete('items', id)
  if (item) {
    await db.delete('audio_blobs', item.audio.file)
  }
}
