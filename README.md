# ആത്മീയമിത്രം — Dhikr & Azkar PWA

Installable, offline-first PWA for daily dhikr/azkar, built with React + Vite +
Tailwind CSS. No login — all content and progress stay on-device in IndexedDB.

## Development

```bash
npm install
npm run dev
```

## Build stages

- [x] **Stage 1** — Data layer: TypeScript schema, IndexedDB (via `idb`), seeded
      with the six default sets (Morning, Evening, After Prayer, Before Sleep,
      Distress, Travel), no dhikr content yet.
- [x] **Stage 2** — Admin CRUD screen (`/admin`, code-split from the main
      bundle) with set/item CRUD + reorder, and a PDF-upload-and-extract flow:
      pdf.js text-layer extraction with an OCR (tesseract.js, Arabic +
      Malayalam) fallback for scanned PDFs, vendored locally so the OCR
      engine itself needs no CDN (see `scripts/vendor-tesseract-core.mjs`).
      Extracted text is pre-filled into editable fields; low-confidence or
      heuristically-corrected extractions are flagged for review.
- [x] **Stage 3** — Core screens: home (greeting, today's status, streak in
      the header, Morning/Evening cards, occasion sets list) and the dhikr
      player (one item per full-screen panel, Arabic/Malayalam display,
      next/prev + swipe + keyboard navigation, manual "Mark complete" once
      every item's been viewed). Islamic-geometric design system (deep teal +
      ivory + muted gold, 8-point star motif, illuminated-manuscript card
      framing, Noto Naskh Arabic / Noto Sans Malayalam / Noto Serif).
- [ ] **Stage 4** — Audio player (play/pause, speed control).
- [ ] **Stage 5** — Streak tracking, PWA/offline, reminder notifications.

## Data model

See `src/types/dhikr.ts` for the full schema (`DhikrSet`, `DhikrItem`,
`DailyProgress`, `AppSettings`). Data access lives in `src/db/`.
