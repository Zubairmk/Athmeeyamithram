import { useEffect, useState } from 'react'
import { putAudioBlob } from '../db/audio'
import { putPdfBlob } from '../db/pdfs'
import { putItem } from '../db/items'
import type { DhikrItem } from '../types/dhikr'

interface AddItemFormProps {
  setId: string
  nextOrder: number
  existing?: DhikrItem
  onSaved: () => void
  onCancel: () => void
}

function extensionFor(file: File, fallback: string): string {
  const fromName = file.name.split('.').pop()
  return fromName && fromName.length <= 5 ? fromName.toLowerCase() : fallback
}

export function AddItemForm({ setId, nextOrder, existing, onSaved, onCancel }: AddItemFormProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!pdfFile) {
      setPdfPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(pdfFile)
    setPdfPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [pdfFile])

  useEffect(() => {
    if (!audioFile) {
      setAudioPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(audioFile)
    setAudioPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [audioFile])

  // Audio is optional at save time — picking both a PDF and an audio file in
  // one go is real friction on a phone, so you can save with just the PDF
  // and attach audio later by editing the item.
  const canSave = (pdfFile || existing) && !saving

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    try {
      const now = new Date().toISOString()
      const id = existing?.id ?? crypto.randomUUID()

      const pdfFileKey = pdfFile
        ? `${setId}-${id}.${extensionFor(pdfFile, 'pdf')}`
        : existing!.pdf_file
      if (pdfFile) await putPdfBlob(pdfFileKey, pdfFile)

      const audioFileKey = audioFile
        ? `${setId}-${id}.${extensionFor(audioFile, 'audio')}`
        : (existing?.audio.file ?? '')
      if (audioFile) await putAudioBlob(audioFileKey, audioFile)

      const item: DhikrItem = {
        id,
        set_id: setId,
        order: existing?.order ?? nextOrder,
        pdf_file: pdfFileKey,
        pdf_file_name: pdfFile?.name ?? existing?.pdf_file_name ?? '',
        audio: { file: audioFileKey },
        created_at: existing?.created_at ?? now,
        updated_at: now,
      }
      await putItem(item)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 rounded border border-neutral-200 bg-white p-4">
      <h2 className="text-sm font-semibold">{existing ? 'Edit dhikr' : 'Add dhikr'}</h2>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          PDF {existing && <span className="text-neutral-400">(optional — replaces existing)</span>}
          <input
            type="file"
            accept="application/pdf"
            className="mt-1 block w-full text-sm"
            onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <label className="text-sm">
          Audio{' '}
          <span className="text-neutral-400">
            ({existing ? 'optional — replaces existing' : 'optional — can add later'})
          </span>
          <input
            type="file"
            accept="audio/*"
            className="mt-1 block w-full text-sm"
            onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      {pdfPreviewUrl && (
        <object
          data={pdfPreviewUrl}
          type="application/pdf"
          className="h-64 w-full rounded border border-neutral-200"
          aria-label="PDF preview"
        >
          <p className="p-3 text-sm text-neutral-500">
            Preview unavailable in this browser — the PDF will still save normally.
          </p>
        </object>
      )}

      {audioPreviewUrl && <audio controls src={audioPreviewUrl} className="w-full" />}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          {saving ? 'Saving…' : existing ? 'Save changes' : 'Save dhikr'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
