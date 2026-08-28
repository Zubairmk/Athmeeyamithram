import { useEffect, useState } from 'react'
import { getAudioBlob } from '../db/audio'

// Resolves an audio_blobs key to a temporary object URL, re-resolving
// whenever the key changes and revoking the previous URL to avoid leaks.
export function useAudioBlobUrl(file: string | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setUrl(null)
      return
    }
    let objectUrl: string | null = null
    let cancelled = false
    getAudioBlob(file).then((blob) => {
      if (cancelled) return
      if (blob) {
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      } else {
        setUrl(null)
      }
    })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  return url
}
