import { MARQUEE } from '@/lib/content'

/** Kinetic skills ticker. Decorative (aria-hidden) — content lives in Stack. */
export function Marquee() {
  const items = [...MARQUEE, ...MARQUEE]
  return (
    <section
      aria-hidden
      className="relative overflow-hidden border-y border-hairline bg-surface/20 py-6"
      data-marquee
    >
      <div className="flex w-max animate-marquee items-center whitespace-nowrap" data-marquee-track>
        {items.map((item, i) => (
          <span key={i} className="flex items-center font-display text-2xl text-muted sm:text-3xl">
            <span className="px-7">{item}</span>
            <span className="text-accent/80" aria-hidden>
              ✦
            </span>
          </span>
        ))}
      </div>
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-canvas to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-canvas to-transparent" />
    </section>
  )
}
