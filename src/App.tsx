import { useEffect, useState } from 'react'
import { getAllSets } from './db/sets'
import { seedDefaultSets } from './db/seed'
import type { DhikrSet } from './types/dhikr'

function App() {
  const [sets, setSets] = useState<DhikrSet[] | null>(null)

  useEffect(() => {
    seedDefaultSets()
      .then(getAllSets)
      .then(setSets)
      .catch((error) => console.error('Failed to load data layer', error))
  }, [])

  return (
    <div className="min-h-screen bg-white p-8 font-sans text-neutral-900">
      <h1 className="text-2xl font-semibold">Data layer check</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Stage 1 debug view — confirms IndexedDB init, seeding, and reads. Replaced in Stage 3.
      </p>
      {sets === null ? (
        <p className="mt-4">Loading…</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {sets.map((set) => (
            <li key={set.id} className="rounded border border-neutral-200 p-3">
              <div className="font-medium">
                {set.title_en} <span className="text-neutral-400">·</span> {set.title_ml}
              </div>
              <div className="text-xs text-neutral-500">
                id: {set.id} · slug: {set.slug} · category: {set.category} · order: {set.order}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
