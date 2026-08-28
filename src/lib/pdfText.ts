import * as pdfjsLib from 'pdfjs-dist'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

export async function loadPdf(data: ArrayBuffer): Promise<PDFDocumentProxy> {
  const loadingTask = pdfjsLib.getDocument({ data })
  return loadingTask.promise
}

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g

// Extracts the embedded text layer, if any, preserving line breaks using
// pdf.js's own `hasEOL` flag per item (pdf.js otherwise gives no layout
// info, which would collapse multi-line content — e.g. an Arabic line and
// its Malayalam translation below it — into one blob). `hasEOL` is more
// reliable than a naive Y-position diff: Arabic harakat (diacritic marks)
// sit at a different baseline from their base letter even within a single
// visual line, which would otherwise cause spurious line breaks there.
// Returns '' for scanned/image-only PDFs.
export async function extractTextLayer(pdf: PDFDocumentProxy): Promise<string> {
  const pageTexts: string[] = []
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    let pageText = ''
    for (const item of content.items) {
      if (!('str' in item)) continue
      // Strip stray control characters some PDF generators emit as
      // word-spacing artifacts (e.g. NUL between shaped Arabic glyph runs).
      pageText += item.str.replace(CONTROL_CHARS, ' ')
      if ('hasEOL' in item && item.hasEOL) pageText += '\n'
    }
    pageTexts.push(
      pageText
        .split('\n')
        .map((line) => line.replace(/[ \t]+/g, ' ').trim())
        .filter((line) => line.length > 0)
        .join('\n'),
    )
  }
  return pageTexts.join('\n').trim()
}

export async function renderPageToCanvas(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  scale = 2.5,
): Promise<HTMLCanvasElement> {
  const page = await pdf.getPage(pageNumber)
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const canvasContext = canvas.getContext('2d')!
  await page.render({ canvasContext, viewport }).promise
  return canvas
}
