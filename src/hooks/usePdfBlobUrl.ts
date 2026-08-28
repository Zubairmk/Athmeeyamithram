import { getPdfBlob } from '../db/pdfs'
import { useBlobUrl } from './useBlobUrl'

export function usePdfBlobUrl(file: string | undefined): string | null {
  return useBlobUrl(file, getPdfBlob)
}
