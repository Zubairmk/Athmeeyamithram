// Some PDF generators (notably Chromium's "Print to PDF") embed Arabic text
// as pre-shaped presentation-form glyphs (Unicode blocks FB50-FDFF, FE70-FEFF)
// written in left-to-right *visual* order rather than logical reading order.
// pdf.js extracts exactly what's in the content stream, so the result reads
// backwards. This is detectable (a high density of presentation-form
// characters) and — for that specific failure mode — fixable: normalizing
// the presentation forms back to base letters and reversing grapheme
// clusters (base letter + any trailing combining marks, so harakat stay
// attached to the right consonant) reconstructs correct logical order.
//
// This is a heuristic correction, not a guarantee, so callers must still
// flag it for human review.

const PRESENTATION_FORM_RANGE = /[ﭐ-﷿ﹰ-﻿]/
const COMBINING_MARK = /\p{M}/u

function presentationFormRatio(text: string): number {
  const chars = [...text.replace(/\s/g, '')]
  if (chars.length === 0) return 0
  const shaped = chars.filter((ch) => PRESENTATION_FORM_RANGE.test(ch)).length
  return shaped / chars.length
}

export function looksLikeShapedVisualOrder(text: string, threshold = 0.15): boolean {
  return presentationFormRatio(text) >= threshold
}

// Reverses a line at the grapheme-cluster level: each base character keeps
// any combining marks (harakat, matras, etc.) that follow it, only the
// cluster order is reversed — a plain per-character reverse would strand
// diacritics next to the wrong base letter.
export function reverseClusters(text: string): string {
  const clusters: string[] = []
  for (const ch of text) {
    if (COMBINING_MARK.test(ch) && clusters.length > 0) {
      clusters[clusters.length - 1] += ch
    } else {
      clusters.push(ch)
    }
  }
  return clusters.reverse().join('')
}

// Applies NFKC (folds presentation forms back to base letters) then
// reverses cluster order, one input line at a time so unaffected lines
// (e.g. a Malayalam translation) are left untouched by the caller.
export function fixShapedVisualOrderLine(line: string): string {
  return reverseClusters(line.normalize('NFKC'))
}
