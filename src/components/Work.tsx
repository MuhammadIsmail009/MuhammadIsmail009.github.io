import { useRef, useState } from 'react'
import { PROJECTS, PROJECT_HIGHLIGHTS, SIGMA_RULES, type Project } from '@/lib/content'
import { SectionHeader, Tag } from '@/components/ui'
import { gsap, useGSAP } from '@/lib/gsap'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { useMotionReady } from '@/lib/motionReady'

const SEVERITY: Record<Project['severity'], { label: string; dot: string; text: string }> = {
  crit: { label: 'crit', dot: 'bg-accent-deep', text: 'text-accent' },
  high: { label: 'high', dot: 'bg-accent', text: 'text-accent' },
  med: { label: 'med', dot: 'bg-faint', text: 'text-muted' },
  info: { label: 'info', dot: 'bg-data/70', text: 'text-data' },
}

// Align the full-bleed track's first card with the centered container's left edge.
const TRACK_PADDING = {
  paddingLeft: 'max(clamp(1.25rem, 5vw, 4rem), calc((100vw - 80rem) / 2))',
  paddingRight: 'clamp(1.25rem, 5vw, 4rem)',
} as const

/** Minimal YAML tinting — keys teal, comments faint, everything else muted. */
function RuleLine({ line }: { line: string }) {
  const hash = line.indexOf('#')
  if (hash === 0 || (hash > 0 && line.slice(0, hash).trim() === '')) {
    return <span className="text-faint">{line}</span>
  }
  const m = /^(\s*(?:- )?)([\w|.-]+)(:)(.*)$/.exec(line)
  if (!m) return <span className="text-muted">{line}</span>
  return (
    <span>
      <span className="text-muted">{m[1]}</span>
      <span className="text-data">{m[2]}</span>
      <span className="text-faint">{m[3]}</span>
      <span className="text-muted">{m[4]}</span>
    </span>
  )
}

function CaseCard({ project, worked }: { project: Project; worked: boolean }) {
  const [ruleOpen, setRuleOpen] = useState(false)
  const rule = SIGMA_RULES[project.id]
  const sev = SEVERITY[project.severity]
  const highlights = PROJECT_HIGHLIGHTS[project.id] ?? []
  const panelId = `rule-${project.id}`

  return (
    <article
      data-work-card
      role="listitem"
      className="group relative flex w-[84vw] max-w-[30rem] shrink-0 snap-start flex-col rounded-2xl border border-hairline bg-surface/40 p-7 transition-colors duration-500 hover:border-accent/40 sm:w-[62vw] md:w-[46vw] lg:w-[30rem]"
    >
      {/* case header — the alert line this card resolves */}
      <div className="flex items-center justify-between gap-3 font-mono text-xs">
        <span className="text-faint">CASE ALR-{project.id}</span>
        <span className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-700 ${
              worked ? 'bg-data' : sev.dot
            }`}
            aria-hidden
          />
          <span className={`transition-colors duration-700 ${worked ? 'text-data' : sev.text}`}>
            {worked ? 'triaged' : sev.label}
          </span>
        </span>
      </div>

      <h3 className="mt-6 font-display text-3xl font-semibold tracking-tight text-fg transition-colors duration-300 group-hover:text-accent">
        {project.title}
      </h3>
      <p className="mt-1.5 font-mono text-xs text-faint">{project.meta}</p>
      <p className="mt-4 text-pretty text-sm leading-relaxed text-muted">{project.description}</p>

      <ul className="mt-5 space-y-1.5">
        {highlights.slice(0, 3).map((h) => (
          <li key={h} className="flex gap-2.5 font-mono text-[0.7rem] leading-relaxed text-muted">
            <span className="mt-0.5 shrink-0 text-accent" aria-hidden>
              ▸
            </span>
            {h}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        <div className="flex flex-wrap gap-2">
          {project.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-6">
          {project.link ? (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono text-xs text-fg transition-colors hover:text-accent"
            >
              {project.linkLabel} <span aria-hidden>↗</span>
            </a>
          ) : (
            <span className="inline-flex items-center gap-2 font-mono text-xs text-faint">
              <span className="h-1.5 w-1.5 rounded-full bg-faint" aria-hidden />
              {project.linkLabel}
            </span>
          )}
          {rule ? (
            <button
              type="button"
              onClick={() => setRuleOpen((o) => !o)}
              aria-expanded={ruleOpen}
              aria-controls={panelId}
              className="inline-flex items-center gap-2 font-mono text-xs text-muted transition-colors hover:text-accent"
            >
              <span className="text-accent" aria-hidden>
                {ruleOpen ? '▾' : '▸'}
              </span>
              detection rule
            </button>
          ) : null}
        </div>

        {rule ? (
          <div
            id={panelId}
            className={`grid transition-[grid-template-rows] duration-500 ease-expo ${
              ruleOpen ? 'mt-5 grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <pre className="max-h-56 overflow-auto rounded-lg border border-hairline bg-[#0c0b0a] p-4 font-mono text-[0.68rem] leading-relaxed">
                {rule.split('\n').map((line, i) => (
                  <div key={i}>
                    <RuleLine line={line} />
                  </div>
                ))}
              </pre>
              <p className="mt-2 font-mono text-[0.6rem] text-faint">
                sigma · written by me · would deploy as-is
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  )
}

/**
 * Selected Work: on desktop the section pins and your scroll drives the case
 * board sideways — each card is an alert that flips to "triaged" as it takes
 * the screen. The HUD is six severity dots being cleared, not a counter.
 * Mobile / reduced motion: native horizontal snap scroller.
 */
export function Work() {
  const reduced = useReducedMotion()
  const ready = useMotionReady()
  const pin = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const total = PROJECTS.length
  const [current, setCurrent] = useState(reduced ? total - 1 : 0)
  const animate = !reduced

  useGSAP(
    () => {
      if (!animate || !ready) return
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
            end: () => '+=' + dist() * 1.15,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              // which case holds the screen right now
              setCurrent(Math.min(total - 1, Math.round(self.progress * (total - 1))))
            },
          },
        })

        // Each card rides in from the right with depth — y-drift, tilt and
        // fade scrubbed by the horizontal ride itself.
        gsap.utils.toArray<HTMLElement>('[data-work-card]', trackEl).forEach((card) => {
          gsap.from(card, {
            y: 90,
            opacity: 0.08,
            rotate: 2.2,
            immediateRender: false,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: 'left 100%',
              end: 'left 52%',
              scrub: true,
            },
          })
        })

        // Mark the section for pinned styling only while the ride exists.
        pinEl.classList.add('is-pinned')
        return () => {
          pinEl.classList.remove('is-pinned')
        }
      })
      return () => mm.revert()
    },
    { dependencies: [ready, animate] },
  )

  return (
    <section id="work" className="py-section" data-work>
      <div ref={pin} className="md:flex md:min-h-screen md:flex-col md:justify-center md:overflow-hidden">
        <div className="px-gutter">
          <div className="mx-auto max-w-content">
            <SectionHeader
              index="/ 03"
              label="Selected Work"
              title="Systems that watch the systems."
              description="Six cases on the board. Scroll rides the queue — every alert gets triaged, detection rules included."
            />
            {/* triage board HUD — six alerts being cleared, desktop ride only */}
            <div className="mt-8 hidden items-center gap-4 md:flex" aria-hidden>
              <span className="flex items-center gap-2">
                {PROJECTS.map((p, i) => (
                  <span
                    key={p.id}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i < current
                        ? 'w-1.5 bg-data'
                        : i === current
                          ? 'w-6 bg-accent'
                          : `w-1.5 ${SEVERITY[p.severity].dot} opacity-40`
                    }`}
                  />
                ))}
              </span>
              <span className="font-mono text-xs text-faint">
                <span className="text-accent">ALR-{PROJECTS[current].id}</span> on screen ·{' '}
                <span className={current === total - 1 ? 'text-data' : 'text-faint'}>
                  {current === total - 1 ? 'queue clear ✓' : `${total - 1 - current} in queue`}
                </span>
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
            className="mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mt-10 md:snap-none md:overflow-visible md:pb-0"
            style={TRACK_PADDING}
          >
            {PROJECTS.map((p, i) => (
              <CaseCard key={p.id} project={p} worked={!animate || i <= current} />
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
