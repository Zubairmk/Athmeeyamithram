// An 8-point geometric star (girih-tile motif), used sparingly as the app's
// one recurring ornamental accent — the streak indicator, the splash motif —
// rather than a literal icon (no flame, no badge).
function starPoints(spikes: number, outerR: number, innerR: number): string {
  const cx = 50
  const cy = 50
  const step = Math.PI / spikes
  let rotation = -Math.PI / 2
  const points: string[] = []
  for (let i = 0; i < spikes; i++) {
    points.push(`${(cx + Math.cos(rotation) * outerR).toFixed(2)},${(cy + Math.sin(rotation) * outerR).toFixed(2)}`)
    rotation += step
    points.push(`${(cx + Math.cos(rotation) * innerR).toFixed(2)},${(cy + Math.sin(rotation) * innerR).toFixed(2)}`)
    rotation += step
  }
  return points.join(' ')
}

const EIGHT_POINT_STAR = starPoints(8, 46, 20)

export function IslamicStar({ className, filled = true }: { className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <polygon
        points={EIGHT_POINT_STAR}
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 4}
        strokeLinejoin="round"
      />
    </svg>
  )
}
