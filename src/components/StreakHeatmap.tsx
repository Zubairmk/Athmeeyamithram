import { buildHeatmapWeeks, type DayStatus } from '../lib/heatmap'
import type { DailyProgress } from '../types/dhikr'

const STATUS_CLASS: Record<DayStatus, string> = {
  both: 'bg-teal-700',
  one: 'bg-teal-700/35',
  none: 'border border-ink/15',
  future: '',
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function StreakHeatmap({ records, weeks = 8 }: { records: DailyProgress[]; weeks?: number }) {
  const weekRows = buildHeatmapWeeks(records, weeks)

  return (
    <div>
      <div className="mb-1.5 grid grid-cols-7 gap-1.5">
        {WEEKDAY_LABELS.map((label, i) => (
          <span key={i} className="text-center text-[10px] text-ink-soft">
            {label}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        {weekRows.map((week, i) => (
          <div key={i} className="grid grid-cols-7 gap-1.5">
            {week.map((day) => (
              <div
                key={day.date}
                title={day.status === 'future' ? undefined : day.date}
                className={`aspect-square rounded-sm ${STATUS_CLASS[day.status]}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3 text-[11px] text-ink-soft">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-teal-700" /> Both completed
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-teal-700/35" /> One completed
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm border border-ink/15" /> None
        </span>
      </div>
    </div>
  )
}
