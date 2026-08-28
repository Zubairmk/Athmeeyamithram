import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllSets } from '../db/sets'
import { getAllProgress, getProgress } from '../db/progress'
import { getItemsForSet } from '../db/items'
import { seedDefaultSets } from '../db/seed'
import { todayDateString } from '../lib/date'
import { computeCurrentStreak } from '../lib/streak'
import type { DhikrSet } from '../types/dhikr'
import { IslamicStar } from '../components/IslamicStar'
import { GeometricDivider } from '../components/GeometricDivider'
import { IlluminatedCard } from '../components/IlluminatedCard'
import { SetIcon } from '../components/SetIcon'
import { StreakHeatmap } from '../components/StreakHeatmap'
import { GearIcon } from '../components/GearIcon'
import type { DailyProgress } from '../types/dhikr'

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

interface SetWithCount extends DhikrSet {
  itemCount: number
}

export function Home() {
  const [timeSets, setTimeSets] = useState<SetWithCount[]>([])
  const [occasionSets, setOccasionSets] = useState<SetWithCount[]>([])
  const [morningDone, setMorningDone] = useState(false)
  const [eveningDone, setEveningDone] = useState(false)
  const [streak, setStreak] = useState(0)
  const [progressRecords, setProgressRecords] = useState<DailyProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      // Awaited here (not just left to App.tsx's own seeding effect) so a
      // brand-new install can't race: without this, Home could read sets
      // before the parallel seed effect in App.tsx finishes writing them,
      // showing an empty home screen that never self-corrects.
      await seedDefaultSets()
      if (cancelled) return
      const [allSets, todayProgress, allProgress] = await Promise.all([
        getAllSets(),
        getProgress(todayDateString()),
        getAllProgress(),
      ])
      const withCounts: SetWithCount[] = await Promise.all(
        allSets.map(async (set) => ({ ...set, itemCount: (await getItemsForSet(set.id)).length })),
      )
      if (cancelled) return
      setTimeSets(withCounts.filter((s) => s.category === 'time'))
      setOccasionSets(withCounts.filter((s) => s.category === 'occasion'))
      setMorningDone(!!todayProgress?.morning_completed)
      setEveningDone(!!todayProgress?.evening_completed)
      setStreak(computeCurrentStreak(allProgress))
      setProgressRecords(allProgress)
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const isSetDone = (slug: string) =>
    slug === 'morning' ? morningDone : slug === 'evening' ? eveningDone : false

  return (
    <div className="min-h-screen bg-paper">
      <header className="relative bg-teal-800 px-6 pt-6 pb-5 text-paper">
        <div className="mx-auto flex max-w-md items-start justify-between">
          <div className="flex items-center gap-2">
            <IslamicStar className="h-6 w-6 text-gold-400" />
            <h1 className="font-malayalam text-2xl font-semibold tracking-wide text-paper">
              ആത്മീയമിത്രം
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full border border-gold-400/40 px-2.5 py-1 text-gold-400">
              <IslamicStar className="h-3.5 w-3.5" />
              <span className="text-sm font-medium">{streak}</span>
            </div>
            <Link
              to="/settings"
              aria-label="Settings"
              className="rounded-full p-1.5 text-gold-400/80 hover:text-gold-400"
            >
              <GearIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="mx-auto mt-4 max-w-md">
          <GeometricDivider className="text-gold-400/50" />
        </div>
      </header>

      <main className="mx-auto max-w-md px-6 py-6">
        <p className="text-sm text-ink-soft">{greeting()}</p>
        <p className="mt-1 text-lg font-medium text-ink">
          {morningDone && eveningDone
            ? 'Today is complete.'
            : morningDone
              ? 'Evening azkar still remain today.'
              : eveningDone
                ? 'Morning azkar still remain today.'
                : "Today's azkar are waiting."}
        </p>

        {loading ? (
          <p className="mt-6 text-sm text-ink-soft">Loading…</p>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {timeSets.map((set) => (
                <Link key={set.id} to={`/sets/${set.id}`}>
                  <IlluminatedCard className="flex h-full flex-col gap-2 p-4">
                    <div className="flex items-center justify-between">
                      <SetIcon icon={set.icon} className="h-6 w-6 text-gold-500" />
                      {isSetDone(set.slug) && (
                        <span className="rounded-full bg-teal-700/10 px-2 py-0.5 text-xs font-medium text-teal-700">
                          Done
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-ink">{set.title_en}</p>
                      <p className="font-malayalam text-sm text-ink-soft">{set.title_ml}</p>
                    </div>
                    <p className="mt-auto text-xs text-ink-soft">{set.itemCount} dhikr</p>
                  </IlluminatedCard>
                </Link>
              ))}
            </div>

            {occasionSets.length > 0 && (
              <>
                <div className="my-6">
                  <GeometricDivider className="text-gold-500/40" />
                </div>
                <p className="mb-3 text-xs font-medium tracking-wide text-ink-soft uppercase">
                  Occasions
                </p>
                <ul className="space-y-2">
                  {occasionSets.map((set) => (
                    <li key={set.id}>
                      <Link to={`/sets/${set.id}`}>
                        <IlluminatedCard className="flex items-center gap-3 p-3">
                          <SetIcon icon={set.icon} className="h-5 w-5 shrink-0 text-gold-500" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-ink">{set.title_en}</p>
                            <p className="font-malayalam truncate text-sm text-ink-soft">
                              {set.title_ml}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs text-ink-soft">{set.itemCount}</span>
                        </IlluminatedCard>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="my-6">
              <GeometricDivider className="text-gold-500/40" />
            </div>
            <p className="mb-3 text-xs font-medium tracking-wide text-ink-soft uppercase">
              Recent activity
            </p>
            <IlluminatedCard className="p-4">
              <StreakHeatmap records={progressRecords} />
            </IlluminatedCard>
          </>
        )}
      </main>
    </div>
  )
}
