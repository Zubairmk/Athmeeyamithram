import { useEffect, useState } from 'react'
import { extractDhikrText } from '../lib/extractDhikrText'
import { putAudioBlob } from '../db/audio'
import { putItem } from '../db/items'
import type { DhikrItem, ExtractionConfidence, ExtractionMethod } from '../types/dhikr'

interface AddItemFormProps {
  setId: string
  nextOrder: number
  existing?: DhikrItem
  onSaved: () => void
  onCancel: () => void
}

function audioExtension(file: File): string {
  const fromName = file.name.split('.').pop()
  if (fromName && fromName.length <= 5) return fromName.toLowerCase()
  if (file.type.includes('mpeg')) return 'mp3'
  if (file.type.includes('wav')) return 'wav'
  if (file.type.includes('ogg')) return 'ogg'
  return 'audio'
}

export function AddItemForm({ setId, nextOrder, existing, onSaved, onCancel }: AddItemFormProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [extractStatus, setExtractStatus] = useState('')
  const [extractError, setExtractError] = useState('')
  const [hasExtractionResult, setHasExtractionResult] = useState(!!existing)

  const [arabicText, setArabicText] = useState(existing?.arabic_text ?? '')
  const [malayalamText, setMalayalamText] = useState(existing?.malayalam_text ?? '')
  const [method, setMethod] = useState<ExtractionMethod>(existing?.source.extraction_method ?? 'text-layer')
  const [confidence, setConfidence] = useState<ExtractionConfidence>(existing?.source.confidence ?? 'high')
  const [needsReview, setNeedsReview] = useState(existing?.source.needs_review ?? false)
  const [sourcePdfName, setSourcePdfName] = useState(existing?.source.pdf_file ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!audioFile) {
      setAudioPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(audioFile)
    setAudioPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [audioFile])

  async function handlePdfSelected(file: File) {
    setSourcePdfName(file.name)
    setExtractError('')
    setHasExtractionResult(false)
    setExtracting(true)
    try {
      const result = await extractDhikrText(file, setExtractStatus)
      setArabicText(result.arabic_text)
      setMalayalamText(result.malayalam_text)
      setMethod(result.method)
      setConfidence(result.confidence)
      setNeedsReview(result.needs_review)
      setHasExtractionResult(true)
    } catch (error) {
      console.error(error)
      setExtractError(
        error instanceof Error ? error.message : 'Failed to extract text from this PDF.',
      )
    } finally {
      setExtracting(false)
      setExtractStatus('')
    }
  }

  const canSave = arabicText.trim().length > 0 && (audioFile || existing) && !extracting

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    try {
      const now = new Date().toISOString()
      const id = existing?.id ?? crypto.randomUUID()
      const audioFileKey = audioFile
        ? `${setId}-${id}.${audioExtension(audioFile)}`
        : existing!.audio.file

      if (audioFile) {
        await putAudioBlob(audioFileKey, audioFile)
      }

      const item: DhikrItem = {
        id,
        set_id: setId,
        order: existing?.order ?? nextOrder,
        arabic_text: arabicText.trim(),
        malayalam_text: malayalamText.trim() || undefined,
        audio: { file: audioFileKey },
        source: {
          pdf_file: sourcePdfName || existing?.source.pdf_file || '',
          extraction_method: method,
          confidence,
          needs_review: needsReview,
        },
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
          PDF {existing && <span className="text-neutral-400">(optional — re-upload to re-extract)</span>}
          <input
            type="file"
            accept="application/pdf"
            className="mt-1 block w-full text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handlePdfSelected(file)
            }}
          />
        </label>
        <label className="text-sm">
          Audio {existing && <span className="text-neutral-400">(optional — replaces existing)</span>}
          <input
            type="file"
            accept="audio/*"
            className="mt-1 block w-full text-sm"
            onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      {audioPreviewUrl && <audio controls src={audioPreviewUrl} className="w-full" />}

      {extracting && (
        <p className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {extractStatus || 'Extracting…'}
        </p>
      )}
      {extractError && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{extractError}</p>
      )}

      {hasExtractionResult && !extracting && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-neutral-100 px-2 py-1 text-neutral-600">
            method: {method}
          </span>
          <span
            className={`rounded-full px-2 py-1 ${
              confidence === 'high'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            confidence: {confidence}
          </span>
          {needsReview && (
            <span className="rounded-full bg-red-50 px-2 py-1 font-medium text-red-700">
              ⚠ needs review — double-check this extraction
            </span>
          )}
        </div>
      )}

      <label className="block text-sm">
        Arabic text
        <textarea
          dir="rtl"
          lang="ar"
          rows={4}
          className="mt-1 w-full rounded border border-neutral-300 p-2 text-lg leading-relaxed"
          value={arabicText}
          onChange={(e) => setArabicText(e.target.value)}
          placeholder="Extracted Arabic text will appear here — review and correct as needed"
        />
      </label>

      <label className="block text-sm">
        Malayalam text (optional)
        <textarea
          dir="auto"
          lang="ml"
          rows={2}
          className="mt-1 w-full rounded border border-neutral-300 p-2 text-sm"
          value={malayalamText}
          onChange={(e) => setMalayalamText(e.target.value)}
          placeholder="Malayalam translation, if present in the source"
        />
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave || saving}
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
