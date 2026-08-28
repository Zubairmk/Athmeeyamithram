import { useEffect, useMemo, useRef, useState, type TouchEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getSet } from '../db/sets'
import { getItemsForSet } from '../db/items'
import { getProgress, putProgress } from '../db/progress'
import { seedDefaultSets } from '../db/seed'
import { todayDateString } from '../lib/date'
import type { DailyProgress, DhikrItem, DhikrSet } from '../types/dhikr'
import { IlluminatedCard } from '../components/IlluminatedCard'
import { AudioDock } from '../components/AudioDock'
import { usePdfBlobUrl } from '../hooks/usePdfBlobUrl'

const SWIPE_THRESHOLD_PX = 50

async function markSetComplete(set: DhikrSet): Promise<void> {
  const date = todayDateString()
  const existing = await getProgress(date)
  const base: DailyProgress = existing ?? {
    date,
    morning_completed: false,
    evening_completed: false,
    occasion_sets_viewed: [],
  }
  if (set.slug === 'morning') base.morning_completed = true
  else if (set.slug === 'evening') base.evening_completed = true
  else if (!base.occasion_sets_viewed.includes(set.id)) {
    base.occasion_sets_viewed = [...base.occasion_sets_viewed, set.id]
  }
  await putProgress(base)
}

export function DhikrPlayer() {
  const { setId } = useParams<{ setId: string }>()
  const [set, setSet] = useState<DhikrSet | null>(null)
  const [items, setItems] = useState<DhikrItem[]>([])
  const [index, setIndex] = useState(0)
  const [viewed, setViewed] = useState<Set<number>>(new Set([0]))
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [marking, setMarking] = useState(false)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    if (!setId) return
    let cancelled = false
    async function load() {
      // Same first-launch race as Home.tsx — matters here too since a
      // deep link/PWA shortcut can land directly on a set before Home ever
      // ran its own seed.
      await seedDefaultSets()
      if (cancelled) return
      const [s, itemList] = await Promise.all([getSet(setId!), getItemsForSet(setId!)])
      if (cancelled) return
      setSet(s ?? null)
      setItems(itemList)
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [setId])

  const allViewed = items.length > 0 && viewed.size >= items.length

  function goTo(next: number) {
    if (next < 0 || next >= items.length) return
    setIndex(next)
    setViewed((prev) => {
      const updated = new Set(prev)
      updated.add(next)
      return updated
    })
  }

  function handleTouchStart(e: TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (delta <= -SWIPE_THRESHOLD_PX) goTo(index + 1)
    else if (delta >= SWIPE_THRESHOLD_PX) goTo(index - 1)
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') goTo(index - 1)
      if (e.key === 'ArrowRight') goTo(index + 1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, items.length])

  const item = items[index]
  const pdfUrl = usePdfBlobUrl(item?.pdf_file)
  const progressLabel = useMemo(
    () => (items.length > 0 ? `${index + 1} / ${items.length}` : ''),
    [index, items.length],
  )

  async function handleMarkComplete() {
    if (!set) return
    setMarking(true)
    try {
      await markSetComplete(set)
      setCompleted(true)
    } finally {
      setMarking(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-paper p-6 text-sm text-ink-soft">Loading…</div>
  }

  if (!set) {
    return (
      <div className="min-h-screen bg-paper p-6">
        <p className="text-ink">Set not found.</p>
        <Link to="/" className="mt-2 inline-block text-sm text-teal-700 underline">
          Back home
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="border-b border-gold-500/30 bg-teal-800 px-5 py-4 text-paper">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Link to="/" className="text-sm text-paper/80 hover:text-paper" aria-label="Back home">
            ← Back
          </Link>
          <div className="text-center">
            <p className="font-malayalam text-sm leading-tight">{set.title_ml}</p>
            <p className="text-xs text-paper/70">{set.title_en}</p>
          </div>
          <span className="w-10 text-right text-xs text-paper/70">{progressLabel}</span>
        </div>
      </header>

      <main
        className={`mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-6 ${
          items.length > 0 ? 'pb-24' : ''
        }`}
      >
        {items.length === 0 ? (
          <p className="text-sm text-ink-soft">
            No dhikr items in this set yet. Add some from the admin panel.
          </p>
        ) : (
          <>
            <div
              className="flex flex-1 flex-col"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <IlluminatedCard corners className="flex flex-1 flex-col p-2 sm:p-3">
                {pdfUrl ? (
                  <object
                    data={pdfUrl}
                    type="application/pdf"
                    className="w-full flex-1 rounded"
                    aria-label="Dhikr PDF"
                  >
                    <p className="p-4 text-center text-sm text-ink-soft">
                      Your browser can't preview PDFs inline.{' '}
                      <a href={pdfUrl} className="text-teal-700 underline" target="_blank" rel="noopener noreferrer">
                        Open it directly
                      </a>
                      .
                    </p>
                  </object>
                ) : (
                  <p className="p-6 text-center text-sm text-ink-soft">Loading…</p>
                )}
              </IlluminatedCard>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                disabled={index === 0}
                className="rounded-full border border-teal-700/30 px-4 py-2 text-sm text-teal-800 disabled:opacity-30"
              >
                ← Previous
              </button>
              <div className="flex gap-1.5">
                {items.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full ${
                      i === index ? 'bg-teal-700' : viewed.has(i) ? 'bg-gold-500/70' : 'bg-ink/15'
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                disabled={index === items.length - 1}
                className="rounded-full border border-teal-700/30 px-4 py-2 text-sm text-teal-800 disabled:opacity-30"
              >
                Next →
              </button>
            </div>

            {allViewed && (
              <div className="mt-6 text-center">
                {completed ? (
                  <p className="text-sm font-medium text-teal-700">✓ Marked complete for today</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleMarkComplete}
                    disabled={marking}
                    className="rounded-full bg-teal-800 px-6 py-2.5 text-sm font-medium text-paper disabled:opacity-60"
                  >
                    {marking ? 'Marking…' : 'Mark complete'}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {item && <AudioDock audioFile={item.audio.file} />}
    </div>
  )
}
