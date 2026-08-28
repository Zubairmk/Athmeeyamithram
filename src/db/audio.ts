import { getDB } from './database'

export async function putAudioBlob(file: string, blob: Blob): Promise<void> {
  const db = await getDB()
  await db.put('audio_blobs', { file, blob })
}

export async function getAudioBlob(file: string): Promise<Blob | undefined> {
  const db = await getDB()
  const record = await db.get('audio_blobs', file)
  return record?.blob
}

export async function deleteAudioBlob(file: string): Promise<void> {
  const db = await getDB()
  await db.delete('audio_blobs', file)
}
