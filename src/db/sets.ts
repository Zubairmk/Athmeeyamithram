import { getDB } from './database'
import type { DhikrSet } from '../types/dhikr'

export async function getAllSets(): Promise<DhikrSet[]> {
  const db = await getDB()
  const sets = await db.getAllFromIndex('sets', 'by-order')
  return sets
}

export async function getSet(id: string): Promise<DhikrSet | undefined> {
  const db = await getDB()
  return db.get('sets', id)
}

export async function putSet(set: DhikrSet): Promise<void> {
  const db = await getDB()
  await db.put('sets', set)
}

export async function deleteSet(id: string): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['sets', 'items'], 'readwrite')
  await tx.objectStore('sets').delete(id)
  const itemIndex = tx.objectStore('items').index('by-set')
  let cursor = await itemIndex.openCursor(IDBKeyRange.only(id))
  while (cursor) {
    await cursor.delete()
    cursor = await cursor.continue()
  }
  await tx.done
}
