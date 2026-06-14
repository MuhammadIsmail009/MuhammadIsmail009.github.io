import { SITE } from '@/lib/content'
import { ButtonLink } from '@/components/ui'

// Hand-placed constellation — the static fallback for the R3F security graph.
const NODES: [number, number][] = [
  [820, 150], [675, 115], [905, 300], [760, 270], [600, 235],
  [705, 420], [860, 455], [560, 395], [640, 560], [800, 615],
  [920, 555], [520, 300], [480, 480], [700, 700], [880, 720], [600, 640],
]
const EDGES: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [1, 4], [3, 4], [3, 5], [2, 6], [5, 6],
  [4, 7], [5, 7], [7, 11], [4, 11], [7, 12], [7, 8], [8, 9], [6, 9],
  [9, 10], [6, 10], [8, 15], [8, 13], [13, 14], [9, 14], [13, 15], [12, 15], [11, 12],
]
const ACTIVE = new Set([0, 7, 9, 14])

function HeroBackdrop() {
  const mask = 'radial-gradient(62% 62% at 62% 45%, #000 38%, transparent 100%)'
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute right-[-12%] top-1/2 h-[78vmin] w-[78vmin] -translate-y-1/2 rounded-full blur-[90px]"
        style={{ background: 'radial-gradient(circle, var(--accent-glow), transparent 64%)' }}
      />
      <svg
        className="absolute inset-0 h-full w-full opacity-60"
        viewBox="0 0 1000 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      >
        <g stroke="rgb(240 133 58 / 0.16)" strokeWidth={1}>
          {EDGES.map(([a, b], i) => (
            <line key={i} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} />
          ))}
        </g>
        {NODES.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={ACTIVE.has(i) ? 4.5 : 2.5}
            fill={ACTIVE.has(i) ? 'rgb(240 133 58 / 0.95)' : 'rgb(242 240 236 / 0.4)'}
          />
        ))}
      </svg>
    </div>
  )
}

export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] items-center overflow-hidden px-gutter pb-24 pt-32"
    >
      {/* 3D scene mounts here in M3; SVG graph is the fallback. */}
      <div data-hero-scene className="absolute inset-0">
        <HeroBackdrop />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-content">
        <p className="kicker mb-7 flex items-center gap-3" data-reveal>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
          {SITE.kicker}
        </p>

        <h1 className="font-display text-display-xl font-semibold text-fg">
          <span data-hero-word className="block">
            Muhammad
          </span>
          <span data-hero-word className="block text-accent text-glow">
            Ismail
          </span>
        </h1>

        <p
          className="mt-8 max-w-prose2 text-pretty text-lg leading-relaxed text-muted sm:text-xl"
          data-reveal
        >
          {SITE.tagline}
        </p>

        <div className="mt-11 flex flex-wrap items-center gap-4" data-reveal>
          <ButtonLink href="#work" variant="primary">
            View Work
          </ButtonLink>
          <ButtonLink href="#contact" variant="ghost">
            Get in touch
          </ButtonLink>
        </div>
      </div>

      {/* scroll cue */}
      <div className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 items-center gap-3 sm:flex">
        <span className="kicker">scroll</span>
        <span className="block h-10 w-px bg-gradient-to-b from-accent/60 to-transparent" />
      </div>
    </section>
  )
}
