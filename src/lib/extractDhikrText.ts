import { extractTextLayer, loadPdf, renderPageToCanvas } from './pdfText'
import { ocrCanvas } from './ocr'
import { splitArabicMalayalam } from './textSplit'
import { fixShapedVisualOrderLine, looksLikeShapedVisualOrder } from './arabicShaping'
import type { ExtractionConfidence, ExtractionMethod } from '../types/dhikr'

export interface ExtractionResult {
  arabic_text: string
  malayalam_text: string
  method: ExtractionMethod
  confidence: ExtractionConfidence
  needs_review: boolean
}

// Below this many non-whitespace characters, a PDF's embedded text layer is
// treated as absent/unusable (e.g. a scanned image with no real text layer),
// and extraction falls back to OCR.
const MIN_TEXT_LAYER_CHARS = 12
const OCR_HIGH_CONFIDENCE_THRESHOLD = 75

// Fixes up per-line shaped/visual-order Arabic (see arabicShaping.ts) and
// reports whether any line needed correcting, since that heuristic fix
// always warrants a human double-check even when the fix looks right.
function normalizeLines(rawText: string): { text: string; anyLineCorrected: boolean } {
  let anyLineCorrected = false
  const lines = rawText.split('\n').map((line) => {
    if (looksLikeShapedVisualOrder(line)) {
      anyLineCorrected = true
      return fixShapedVisualOrderLine(line)
    }
    return line.normalize('NFKC')
  })
  return { text: lines.join('\n'), anyLineCorrected }
}

export async function extractDhikrText(
  file: File,
  onProgress?: (status: string) => void,
): Promise<ExtractionResult> {
  onProgress?.('Reading PDF…')
  const buffer = await file.arrayBuffer()
  const pdf = await loadPdf(buffer)

  onProgress?.('Extracting text layer…')
  const rawLayerText = await extractTextLayer(pdf)
  const nonWhitespaceChars = rawLayerText.replace(/\s/g, '').length
  const hasUsableTextLayer =
    nonWhitespaceChars >= MIN_TEXT_LAYER_CHARS && !rawLayerText.includes('�')

  if (hasUsableTextLayer) {
    const { text: layerText, anyLineCorrected } = normalizeLines(rawLayerText)
    const { arabic_text, malayalam_text } = splitArabicMalayalam(layerText)
    return {
      arabic_text,
      malayalam_text,
      method: 'text-layer',
      confidence: anyLineCorrected ? 'low' : 'high',
      needs_review: anyLineCorrected,
    }
  }

  onProgress?.('No usable text layer — running OCR (this can take a moment)…')
  const ocrTexts: string[] = []
  let minConfidence = 100
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    onProgress?.(`OCR page ${pageNumber} of ${pdf.numPages}…`)
    const canvas = await renderPageToCanvas(pdf, pageNumber)
    const { text, confidence } = await ocrCanvas(canvas)
    ocrTexts.push(text)
    minConfidence = Math.min(minConfidence, confidence)
  }

  const { arabic_text, malayalam_text } = splitArabicMalayalam(ocrTexts.join('\n'))
  const confidence: ExtractionConfidence =
    minConfidence >= OCR_HIGH_CONFIDENCE_THRESHOLD ? 'high' : 'low'

  return {
    arabic_text,
    malayalam_text,
    method: 'ocr',
    confidence,
    needs_review: confidence === 'low',
  }
}
