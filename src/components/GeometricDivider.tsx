// A thin repeating geometric strip (diamond chain, in the gold accent) used
// as a section divider — the app's one recurring ornamental motif besides
// the star, kept deliberately quiet rather than a busy all-over pattern.
export function GeometricDivider({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 12"
      preserveAspectRatio="xMidYMid meet"
      className={`h-3 w-full text-gold-500/60 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <pattern id="geo-divider-tile" width="12" height="12" patternUnits="userSpaceOnUse">
          <path
            d="M6 1 L11 6 L6 11 L1 6 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="120" height="12" fill="url(#geo-divider-tile)" />
    </svg>
  )
}
