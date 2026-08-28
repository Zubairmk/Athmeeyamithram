import { createWorker } from 'tesseract.js'

export interface OcrResult {
  text: string
  confidence: number // 0-100, tesseract's mean confidence
}

const OCR_TIMEOUT_MS = 45_000

// The OCR engine itself (worker script + wasm core) is vendored locally under
// /tesseract-core so it never depends on a CDN. Language trained-data (ara,
// mal) is still fetched from the standard tesseract.js-data CDN on first use
// and then cached by tesseract.js itself for offline reuse afterwards — full
// pre-bundling of traineddata into the service worker is addressed in the
// PWA/offline stage.
//
// tesseract.js has a known gap here: if the language-data fetch inside
// `createWorker()` fails (e.g. no network on first use), the promise it
// returns never settles — its internal error handling swallows the
// rejection instead of propagating it. The only signal is the `errorHandler`
// callback, so we race that (plus a hard timeout as a last-resort net for
// any other hang) against the normal happy path.
export async function ocrCanvas(canvas: HTMLCanvasElement): Promise<OcrResult> {
  let rejectFromWorkerError: ((reason: unknown) => void) | null = null
  const workerErrorPromise = new Promise<never>((_, reject) => {
    rejectFromWorkerError = reject
  })
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(
        new Error(
          'OCR timed out. This usually means the Arabic/Malayalam language data could not be downloaded — check your internet connection and try again.',
        ),
      )
    }, OCR_TIMEOUT_MS)
  })

  const recognizePromise = (async () => {
    const worker = await createWorker(['ara', 'mal'], undefined, {
      workerPath: '/tesseract-core/worker.min.js',
      corePath: '/tesseract-core',
      errorHandler: (error) => {
        rejectFromWorkerError?.(error instanceof Error ? error : new Error(String(error)))
      },
    })
    try {
      const { data } = await worker.recognize(canvas)
      return { text: data.text.trim(), confidence: data.confidence }
    } finally {
      await worker.terminate().catch(() => {})
    }
  })()

  return Promise.race([recognizePromise, workerErrorPromise, timeoutPromise])
}
