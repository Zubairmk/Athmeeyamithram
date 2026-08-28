// Heuristic split of PDF-extracted text (Arabic dhikr + occasional Malayalam
// translation lines) into separate arabic/malayalam blocks, so the admin gets
// a pre-filled starting point instead of one undifferentiated blob.

const ARABIC_RANGE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/
const MALAYALAM_RANGE = /[ഀ-ൿ]/

type LineScript = 'arabic' | 'malayalam' | 'neutral'

function classifyLine(line: string): LineScript {
  let arabicCount = 0
  let malayalamCount = 0
  for (const ch of line) {
    if (ARABIC_RANGE.test(ch)) arabicCount++
    else if (MALAYALAM_RANGE.test(ch)) malayalamCount++
  }
  if (arabicCount === 0 && malayalamCount === 0) return 'neutral'
  return arabicCount >= malayalamCount ? 'arabic' : 'malayalam'
}

export interface SplitTextResult {
  arabic_text: string
  malayalam_text: string
}

export function splitArabicMalayalam(rawText: string): SplitTextResult {
  const lines = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const arabicLines: string[] = []
  const malayalamLines: string[] = []
  let lastScript: LineScript = 'arabic'

  for (const line of lines) {
    const script = classifyLine(line)
    const target = script === 'neutral' ? lastScript : script
    if (script !== 'neutral') lastScript = script
    if (target === 'malayalam') malayalamLines.push(line)
    else arabicLines.push(line)
  }

  return {
    arabic_text: arabicLines.join('\n'),
    malayalam_text: malayalamLines.join('\n'),
  }
}
