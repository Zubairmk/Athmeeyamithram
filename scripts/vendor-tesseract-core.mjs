// Copies the tesseract.js worker + wasm core (LSTM-only variants) from
// node_modules into public/tesseract-core, so the OCR engine is served
// same-origin instead of depending on a CDN. Runs on `npm install` via
// the `postinstall` script; output is gitignored, not committed.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const destDir = join(root, 'public', 'tesseract-core')
mkdirSync(destDir, { recursive: true })

const files = [
  ['tesseract.js/dist/worker.min.js', 'worker.min.js'],
  ['tesseract.js-core/tesseract-core-lstm.wasm', 'tesseract-core-lstm.wasm'],
  ['tesseract.js-core/tesseract-core-lstm.wasm.js', 'tesseract-core-lstm.wasm.js'],
  ['tesseract.js-core/tesseract-core-simd-lstm.wasm', 'tesseract-core-simd-lstm.wasm'],
  ['tesseract.js-core/tesseract-core-simd-lstm.wasm.js', 'tesseract-core-simd-lstm.wasm.js'],
  ['tesseract.js-core/tesseract-core-relaxedsimd-lstm.wasm', 'tesseract-core-relaxedsimd-lstm.wasm'],
  ['tesseract.js-core/tesseract-core-relaxedsimd-lstm.wasm.js', 'tesseract-core-relaxedsimd-lstm.wasm.js'],
]

for (const [src, destName] of files) {
  const srcPath = join(root, 'node_modules', src)
  if (!existsSync(srcPath)) {
    console.warn(`[vendor-tesseract-core] missing ${srcPath}, skipping`)
    continue
  }
  copyFileSync(srcPath, join(destDir, destName))
}

console.log('[vendor-tesseract-core] vendored OCR engine into public/tesseract-core')
