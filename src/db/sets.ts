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
  const tx = db.transaction(['sets', 'items', 'audio_blobs', 'pdf_blobs'], 'readwrite')
  await tx.objectStore('sets').delete(id)
  const itemIndex = tx.objectStore('items').index('by-set')
  const audioStore = tx.objectStore('audio_blobs')
  const pdfStore = tx.objectStore('pdf_blobs')
  let cursor = await itemIndex.openCursor(IDBKeyRange.only(id))
  while (cursor) {
    await audioStore.delete(cursor.value.audio.file)
    await pdfStore.delete(cursor.value.pdf_file)
    await cursor.delete()
    cursor = await cursor.continue()
  }
  await tx.done
}

// Renumbers `order` to a dense 1..n sequence matching the given id order,
// so drag/up-down reordering never leaves gaps or duplicates.
export async function reorderSets(orderedIds: string[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('sets', 'readwrite')
  const store = tx.objectStore('sets')
  for (let i = 0; i < orderedIds.length; i++) {
    const set = await store.get(orderedIds[i])
    if (set) {
      set.order = i + 1
      set.updated_at = new Date().toISOString()
      await store.put(set)
    }
  }
  await tx.done
}
