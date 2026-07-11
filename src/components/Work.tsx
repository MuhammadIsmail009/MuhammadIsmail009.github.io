import { useRef } from 'react'
import { PROJECTS, type Project } from '@/lib/content'
import { SectionHeader, Tag } from '@/components/ui'
import { gsap, useGSAP } from '@/lib/gsap'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { useMotionReady } from '@/lib/motionReady'

// Align the full-bleed track's first card with the centered container's left edge.
const TRACK_PADDING = {
  paddingLeft: 'max(clamp(1.25rem, 5vw, 4rem), calc((100vw - 80rem) / 2))',
  paddingRight: 'clamp(1.25rem, 5vw, 4rem)',
} as const

function WorkCard({ project }: { project: Project }) {
  return (
    <article
      data-work-card
      role="listitem"
      className="group relative flex w-[82vw] max-w-[28rem] shrink-0 snap-start flex-col justify-between rounded-2xl border border-hairline bg-surface/40 p-7 hover:border-accent/40 sm:w-[60vw] md:w-[44vw] lg:w-[28rem]"
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <span className="font-display text-7xl font-semibold leading-none text-faint/40 transition-colors duration-500 group-hover:text-accent/40">
            {project.id}
          </span>
          <span className="kicker mt-2 text-right">{project.meta}</span>
        </div>

        <h3 className="mt-7 font-display text-3xl font-semibold tracking-tight text-fg transition-colors duration-300 group-hover:text-accent">
          {project.title}
        </h3>
        <p className="mt-4 text-pretty text-sm leading-relaxed text-muted">{project.description}</p>
      </div>

      <div className="mt-8">
        <div className="flex flex-wrap gap-2">
          {project.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
        {project.link ? (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 font-mono text-xs text-fg transition-colors hover:text-accent"
            data-cursor-label="OPEN"
          >
            {project.linkLabel}
            <span aria-hidden>↗</span>
          </a>
        ) : (
          <span className="mt-6 inline-flex items-center gap-2 font-mono text-xs text-faint">
            <span className="h-1.5 w-1.5 rounded-full bg-faint" aria-hidden />
            {project.linkLabel}
          </span>
        )}
      </div>
    </article>
  )
}

/**
 * Selected work. Desktop (md+): the track pins fullscreen and scroll drives it
 * horizontally — cards drift in with depth, a counter + progress HUD track the
 * ride. Mobile / reduced motion: the native snap scroller stays.
 */
export function Work() {
  const reduced = useReducedMotion()
  const ready = useMotionReady()
  const pin = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const counter = useRef<HTMLSpanElement>(null)
  const progress = useRef<HTMLDivElement>(null)
  const total = PROJECTS.length

  useGSAP(
    () => {
      if (reduced || !ready) return
      const pinEl = pin.current
      const trackEl = track.current
      if (!pinEl || !trackEl) return

      const mm = gsap.matchMedia()
      mm.add('(min-width: 768px)', () => {
        const dist = () => Math.max(0, trackEl.scrollWidth - window.innerWidth)

        const tween = gsap.to(trackEl, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: pinEl,
            start: 'top top',
            end: () => '+=' + dist(),
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (progress.current)
                progress.current.style.transform = `scaleX(${self.progress})`
              if (counter.current) {
                const i = Math.min(total, Math.round(self.progress * (total - 1)) + 1)
                counter.current.textContent = String(i).padStart(2, '0')
              }
            },
          },
        })

        // Depth: each card rises in as it enters from the right, scrubbed by
        // the horizontal ride itself.
        gsap.utils.toArray<HTMLElement>('[data-work-card]', trackEl).forEach((card) => {
          gsap.from(card, {
            y: 60,
            opacity: 0.15,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: 'left 95%',
              end: 'left 55%',
              scrub: true,
            },
          })
        })
      })
      return () => mm.revert()
    },
    { dependencies: [ready, reduced] },
  )

  return (
    <section id="work" className="py-section" data-work>
      <div ref={pin} className="md:flex md:h-screen md:flex-col md:justify-center md:overflow-hidden">
        <div className="px-gutter">
          <div className="mx-auto max-w-content">
            <SectionHeader
              index="/ 03"
              label="Selected Work"
              title="Systems that watch the systems."
              description="Detection platforms, security research, and full-stack builds. Scroll the track — or jump to the repos."
            />
            {/* HUD — position + progress, desktop ride only */}
            <div className="mt-8 hidden items-center gap-5 md:flex" aria-hidden>
              <span className="font-mono text-xs tabular-nums text-faint">
                <span ref={counter} className="text-accent">
                  01
                </span>{' '}
                / {String(total).padStart(2, '0')}
              </span>
              <span className="relative block h-px w-40 overflow-hidden bg-hairline">
                <span
                  ref={progress}
                  className="absolute inset-0 origin-left bg-accent"
                  style={{ transform: 'scaleX(0)' }}
                />
              </span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div
            ref={track}
            data-work-track
            role="list"
            aria-label="Selected work"
            tabIndex={0}
            className="mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mt-10 md:snap-none md:overflow-visible md:pb-0"
            style={TRACK_PADDING}
          >
            {PROJECTS.map((p) => (
              <WorkCard key={p.id} project={p} />
            ))}
          </div>
          {/* affordance: hint that the track continues (mobile scroller only) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-canvas to-transparent md:hidden"
          />
        </div>
      </div>
    </section>
  )
}
