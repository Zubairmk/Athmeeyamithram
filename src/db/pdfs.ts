import { getDB } from './database'

export async function putPdfBlob(file: string, blob: Blob): Promise<void> {
  const db = await getDB()
  await db.put('pdf_blobs', { file, blob })
}

export async function getPdfBlob(file: string): Promise<Blob | undefined> {
  const db = await getDB()
  const record = await db.get('pdf_blobs', file)
  return record?.blob
}

export async function deletePdfBlob(file: string): Promise<void> {
  const db = await getDB()
  await db.delete('pdf_blobs', file)
}
