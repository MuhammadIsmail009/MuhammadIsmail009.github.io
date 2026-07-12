import { useEffect, useRef, useState } from 'react'
import { PROJECTS, PROJECT_HIGHLIGHTS, SIGMA_RULES, type Project } from '@/lib/content'
import { SectionHeader, Tag } from '@/components/ui'
import { ScrollTrigger, useGSAP } from '@/lib/gsap'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { useMotionReady } from '@/lib/motionReady'

type Phase = 'queued' | 'working' | 'triaged'

const SEVERITY: Record<Project['severity'], { label: string; dot: string; text: string }> = {
  crit: { label: 'crit', dot: 'bg-accent-deep', text: 'text-accent' },
  high: { label: 'high', dot: 'bg-accent', text: 'text-accent' },
  med: { label: 'med', dot: 'bg-faint', text: 'text-muted' },
  info: { label: 'info', dot: 'bg-data/70', text: 'text-data' },
}

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

function StatusChip({ phase }: { phase: Phase }) {
  if (phase === 'triaged')
    return <span className="shrink-0 font-mono text-xs text-data">● triaged</span>
  if (phase === 'working')
    return (
      <span className="shrink-0 animate-pulse-soft font-mono text-xs text-accent">
        ◌ working…
      </span>
    )
  return <span className="shrink-0 font-mono text-xs text-faint">○ queued</span>
}

function CaseCard({
  project,
  phase,
  innerRef,
}: {
  project: Project
  phase: Phase
  innerRef: (el: HTMLLIElement | null) => void
}) {
  const [ruleOpen, setRuleOpen] = useState(false)
  const rule = SIGMA_RULES[project.id]
  const sev = SEVERITY[project.severity]
  const highlights = PROJECT_HIGHLIGHTS[project.id] ?? []
  const panelId = `rule-${project.id}`
  const open = phase === 'triaged'

  return (
    <li ref={innerRef} className={`case-row ${open ? 'is-worked' : ''}`}>
      {/* queue line */}
      <div className="flex items-center gap-4 py-4 font-mono text-xs">
        <span className="text-faint">ALR-{project.id}</span>
        <span className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-700 ${
              open ? 'bg-data' : sev.dot
            } ${phase === 'working' ? 'animate-ping' : ''}`}
            aria-hidden
          />
          <span className={open ? 'text-data' : sev.text}>{sev.label}</span>
        </span>
        <span
          className={`truncate font-display text-base font-semibold tracking-tight transition-colors duration-500 sm:text-lg ${
            open ? 'text-fg' : 'text-muted'
          }`}
        >
          {project.title}
        </span>
        <span className="ml-auto hidden shrink-0 text-faint sm:block">{project.meta}</span>
        <StatusChip phase={phase} />
      </div>

      {/* the case file */}
      <div className="case-body" aria-hidden={!open}>
        <div className="min-h-0 overflow-hidden">
          <div className="case-card group relative mb-10 overflow-hidden rounded-2xl border border-hairline bg-surface/40 p-7 sm:p-9">
            {/* ghost case number */}
            <span
              className="pointer-events-none absolute -right-3 -top-7 select-none font-display text-[7.5rem] font-semibold leading-none text-fg/[0.045] transition-colors duration-700 group-hover:text-accent/10 sm:text-[10rem]"
              aria-hidden
            >
              {project.id}
            </span>

            <div className="relative grid gap-9 lg:grid-cols-[1fr_minmax(0,21rem)]">
              <div>
                <p className="kicker" data-case-item style={{ animationDelay: '80ms' }}>
                  case ALR-{project.id} · {project.meta}
                </p>
                <h3
                  className="mt-3 font-display text-3xl font-semibold tracking-tight text-fg transition-colors duration-300 group-hover:text-accent sm:text-4xl"
                  data-case-item
                  style={{ animationDelay: '150ms' }}
                >
                  {project.title}
                </h3>
                <p
                  className="mt-4 max-w-prose2 text-pretty text-sm leading-relaxed text-muted sm:text-base"
                  data-case-item
                  style={{ animationDelay: '220ms' }}
                >
                  {project.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-2" data-case-item style={{ animationDelay: '290ms' }}>
                  {project.tags.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
                <div
                  className="mt-7 flex flex-wrap items-center gap-6"
                  data-case-item
                  style={{ animationDelay: '360ms' }}
                >
                  {project.link ? (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={open ? 0 : -1}
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
                      tabIndex={open ? 0 : -1}
                      onClick={() => setRuleOpen((o) => !o)}
                      aria-expanded={ruleOpen}
                      aria-controls={panelId}
                      className="inline-flex items-center gap-2 font-mono text-xs text-muted transition-colors hover:text-accent"
                    >
                      <span className="text-accent" aria-hidden>
                        {ruleOpen ? '▾' : '▸'}
                      </span>
                      view detection rule
                    </button>
                  ) : null}
                </div>

                {rule ? (
                  <div
                    id={panelId}
                    className={`grid transition-[grid-template-rows] duration-500 ease-expo ${
                      ruleOpen ? 'mt-6 grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <pre className="overflow-x-auto rounded-lg border border-hairline bg-[#0c0b0a] p-4 font-mono text-[0.7rem] leading-relaxed">
                        {rule.split('\n').map((line, i) => (
                          <div key={i}>
                            <RuleLine line={line} />
                          </div>
                        ))}
                      </pre>
                      <p className="mt-2 font-mono text-[0.62rem] text-faint">
                        sigma · written by me · would deploy as-is
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              <div
                className="lg:border-l lg:border-hairline lg:pl-8"
                data-case-item
                style={{ animationDelay: '430ms' }}
              >
                <p className="kicker mb-4">evidence</p>
                <ul className="space-y-2.5">
                  {highlights.map((h) => (
                    <li
                      key={h}
                      className="flex gap-2.5 font-mono text-xs leading-relaxed text-muted"
                    >
                      <span className="mt-0.5 shrink-0 text-accent" aria-hidden>
                        ▸
                      </span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

/**
 * Selected Work as a triage queue: projects land as dim alert rows and
 * scrolling works the board — each row flickers "working…", then unfolds
 * into its case file. Reduced motion ships everything open and settled.
 */
export function Work() {
  const reduced = useReducedMotion()
  const ready = useMotionReady()
  const rows = useRef<(HTMLLIElement | null)[]>([])
  const timers = useRef<number[]>([])
  const animate = !reduced
  const [phases, setPhases] = useState<Phase[]>(() =>
    PROJECTS.map(() => (animate ? 'queued' : 'triaged')),
  )

  // The queue is worked like a real one: scroll makes rows eligible, but an
  // "analyst" processes them strictly one at a time, in order — so the
  // working→triaged beat is visible even if all rows enter view at once.
  const phasesRef = useRef(phases)
  phasesRef.current = phases
  const eligible = useRef<boolean[]>(PROJECTS.map(() => false))
  const busy = useRef(false)

  const pump = () => {
    if (busy.current) return
    const i = phasesRef.current.findIndex((p, idx) => p === 'queued' && eligible.current[idx])
    if (i < 0) return
    busy.current = true
    setPhases((prev) => {
      const next = [...prev]
      next[i] = 'working'
      return next
    })
    timers.current.push(
      window.setTimeout(() => {
        setPhases((prev) => {
          const next = [...prev]
          next[i] = 'triaged'
          return next
        })
        timers.current.push(
          window.setTimeout(() => {
            busy.current = false
            pump()
          }, 260),
        )
      }, 460),
    )
  }

  useGSAP(
    () => {
      if (!animate || !ready) return
      rows.current.forEach((el, i) => {
        if (!el) return
        ScrollTrigger.create({
          trigger: el,
          start: 'top 82%',
          once: true,
          onEnter: () => {
            eligible.current[i] = true
            pump()
          },
        })
      })
    },
    { dependencies: [ready, animate] },
  )

  useEffect(() => {
    const t = timers.current
    return () => t.forEach((id) => window.clearTimeout(id))
  }, [])

  const openCount = phases.filter((p) => p !== 'triaged').length

  return (
    <section id="work" className="px-gutter py-section">
      <div className="mx-auto max-w-content">
        <SectionHeader
          index="/ 03"
          label="Selected Work"
          title="Systems that watch the systems."
          description="Six cases on the board. Scroll works the queue — each alert opens into the project behind it, detection rule included."
        />

        <div className="mt-8 flex items-center gap-3 font-mono text-xs text-faint" aria-hidden>
          <span className={openCount ? 'text-accent' : 'text-data'}>
            {openCount ? `queue: ${String(openCount).padStart(2, '0')} open` : 'queue clear ✓'}
          </span>
          <span className="h-px flex-1 bg-hairline" />
        </div>

        <ol className="mt-4 border-t border-hairline">
          {PROJECTS.map((p, i) => (
            <CaseCard
              key={p.id}
              project={p}
              phase={phases[i]}
              innerRef={(el) => {
                rows.current[i] = el
              }}
            />
          ))}
        </ol>
      </div>
    </section>
  )
}
