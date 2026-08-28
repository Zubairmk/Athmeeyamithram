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
- [ ] **Stage 2** — Admin CRUD screen (`/admin`) with PDF-upload-and-extract flow.
- [ ] **Stage 3** — Core screens (home, dhikr player).
- [ ] **Stage 4** — Audio player (play/pause, speed control).
- [ ] **Stage 5** — Streak tracking, PWA/offline, reminder notifications.

## Data model

See `src/types/dhikr.ts` for the full schema (`DhikrSet`, `DhikrItem`,
`DailyProgress`, `AppSettings`). Data access lives in `src/db/`.
