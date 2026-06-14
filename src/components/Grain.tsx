/**
 * Film-grain + vignette atmosphere. Pure CSS/SVG, no JS, sits above content but
 * ignores pointer events. Low opacity so it reads as texture, not noise.
 */
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

export function Grain() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60]">
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: NOISE, backgroundSize: '160px 160px' }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(130% 130% at 50% 0%, transparent 52%, rgba(0,0,0,0.55) 100%)',
        }}
      />
    </div>
  )
}
