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
- [x] **Stage 4** — Docked audio player on the dhikr player screen: play/
      pause, seek bar, and 0.75x/1x/1.25x/1.5x speed control, styled with the
      teal/gold palette. Mounted once per screen so the chosen speed carries
      across items, and playback continues onto the next item automatically
      if it was already playing when you navigate.
- [x] **Stage 5** — Streak calendar/heatmap on Home (last 8 weeks, teal
      intensity by both/one/none completed); PWA installability + offline via
      `vite-plugin-pwa` (manifest, service worker precaching the app shell —
      the admin bundle and vendored OCR engine are excluded from precache and
      runtime-cached instead, so a regular user's install stays small);
      configurable Morning/Evening reminders (`/settings`) using the Web
      Notifications API.

  Reminder notifications are necessarily best-effort: this is a fully local,
  no-login PWA with no backend, and there's no way for a web app to wake a
  fully-closed browser at an exact time without Web Push + a server. Reminders
  are checked once on load and then every minute while the app stays open
  (including in a background tab) — the standard approach for this kind of
  app, and what the in-app copy on the Settings screen explains to the user.

## Data model

See `src/types/dhikr.ts` for the full schema (`DhikrSet`, `DhikrItem`,
`DailyProgress`, `AppSettings`). Data access lives in `src/db/`.

## Building for production / testing the PWA

`npm run dev` does not register the service worker (by design — this is the
normal way vite-plugin-pwa works, so it never gets in the way of HMR). To
test installability and offline behavior, use a production build:

```bash
npm run build
npm run preview
```

## Deployment

Deployed to GitHub Pages via `.github/workflows/deploy.yml`, which builds and
publishes on every push to `main`. Live at:
**https://zubairmk.github.io/athmeeyamithram/**

Two things this deployment target shapes, both in `vite.config.ts` /
`src/main.tsx`:
- `base: '/athmeeyamithram/'` — it's a project Pages site (served under a
  subpath), not a user/org root site.
- `HashRouter` instead of `BrowserRouter` — GitHub Pages can't be given a
  server-side rewrite rule, so a direct/bookmarked visit to a route like
  `/admin` needs the route to live in the URL fragment (`#/admin`) rather
  than the path, or it 404s.
