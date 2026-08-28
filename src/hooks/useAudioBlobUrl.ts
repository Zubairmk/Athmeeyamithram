import { getAudioBlob } from '../db/audio'
import { useBlobUrl } from './useBlobUrl'

export function useAudioBlobUrl(file: string | undefined): string | null {
  return useBlobUrl(file, getAudioBlob)
}
