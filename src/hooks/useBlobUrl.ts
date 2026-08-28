import { useEffect, useState } from 'react'

// Resolves a blob-store key to a temporary object URL via the given getter,
// re-resolving whenever the key changes and revoking the previous URL to
// avoid leaks. Shared by audio and PDF blob lookups.
export function useBlobUrl(
  file: string | undefined,
  getBlob: (file: string) => Promise<Blob | undefined>,
): string | null {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setUrl(null)
      return
    }
    let objectUrl: string | null = null
    let cancelled = false
    getBlob(file).then((blob) => {
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
  }, [file, getBlob])

  return url
}
