import { IslamicStar } from './IslamicStar'

// Simple geometric line icons for set cards/links — no flame, no literal
// mosque/building illustrations, no clip-art. Matches the icon keys chosen
// in the admin set editor (src/admin/AdminSetsPage.tsx).
const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

// 8 short rays radiating from (cx, cy), from radius r1 to r2.
function sunRays(cx: number, cy: number, r1: number, r2: number): string {
  const segments: string[] = []
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4
    const x1 = cx + Math.cos(angle) * r1
    const y1 = cy + Math.sin(angle) * r1
    const x2 = cx + Math.cos(angle) * r2
    const y2 = cy + Math.sin(angle) * r2
    segments.push(`M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`)
  }
  return segments.join(' ')
}

function Sunrise() {
  return (
    <svg viewBox="0 0 24 24" {...STROKE}>
      <circle cx="12" cy="9.5" r="4" />
      <path d={sunRays(12, 9.5, 5.5, 7.5)} />
      <path d="M3 19h18" />
    </svg>
  )
}

function Sunset() {
  return (
    <svg viewBox="0 0 24 24" {...STROKE}>
      <circle cx="12" cy="16" r="4" />
      <path d={sunRays(12, 16, 5.5, 7.5)} />
      <path d="M3 19h18" />
    </svg>
  )
}

function PrayerMat() {
  return (
    <svg viewBox="0 0 24 24" {...STROKE}>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M7 9a5 5 0 0 1 10 0v2H7Z M4 15h16" />
    </svg>
  )
}

function Crescent() {
  return (
    <svg viewBox="0 0 24 24" {...STROKE}>
      <path d="M15.5 4.5a8 8 0 1 0 0 15 6.5 6.5 0 1 1 0-15Z" />
    </svg>
  )
}

function Shield() {
  return (
    <svg viewBox="0 0 24 24" {...STROKE}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
    </svg>
  )
}

function Compass() {
  return (
    <svg viewBox="0 0 24 24" {...STROKE}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-2 6-6 2 2-6 6-2Z" />
    </svg>
  )
}

const ICONS: Record<string, () => React.JSX.Element> = {
  sunrise: Sunrise,
  sunset: Sunset,
  'prayer-mat': PrayerMat,
  crescent: Crescent,
  shield: Shield,
  compass: Compass,
}

export function SetIcon({ icon, className }: { icon: string; className?: string }) {
  const Cmp = ICONS[icon]
  if (!Cmp) {
    return <IslamicStar className={className} filled={false} />
  }
  return (
    <span className={className}>
      <Cmp />
    </span>
  )
}
