import type { ReactNode } from 'react'
import { IslamicStar } from './IslamicStar'

// A thin gold-line bordered card, echoing illuminated-manuscript framing.
// `corners` adds a quiet star flourish at each corner for the screen's one
// featured element — used sparingly, not on every card.
export function IlluminatedCard({
  children,
  corners = false,
  className = '',
}: {
  children: ReactNode
  corners?: boolean
  className?: string
}) {
  return (
    <div
      className={`relative rounded-lg border border-gold-500/50 bg-white/60 ${className}`}
    >
      {corners && (
        <>
          <IslamicStar className="pointer-events-none absolute -top-2 -left-2 h-4 w-4 text-gold-500" />
          <IslamicStar className="pointer-events-none absolute -top-2 -right-2 h-4 w-4 text-gold-500" />
          <IslamicStar className="pointer-events-none absolute -bottom-2 -left-2 h-4 w-4 text-gold-500" />
          <IslamicStar className="pointer-events-none absolute -bottom-2 -right-2 h-4 w-4 text-gold-500" />
        </>
      )}
      {children}
    </div>
  )
}
