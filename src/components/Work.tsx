import { useRef, useState } from 'react'
import { PROJECTS, PROJECT_HIGHLIGHTS, SIGMA_RULES, type Project } from '@/lib/content'
import { SectionHeader, Tag } from '@/components/ui'
import { ScrollTrigger, useGSAP } from '@/lib/gsap'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { useMotionReady } from '@/lib/motionReady'

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

function CaseCard({
  project,
  worked,
  innerRef,
}: {
  project: Project
  worked: boolean
  innerRef: (el: HTMLLIElement | null) => void
}) {
  const [ruleOpen, setRuleOpen] = useState(false)
  const rule = SIGMA_RULES[project.id]
  const sev = SEVERITY[project.severity]
  const highlights = PROJECT_HIGHLIGHTS[project.id] ?? []
  const panelId = `rule-${project.id}`

  return (
    <li
      ref={innerRef}
      className={`case-row border-b border-hairline ${worked ? 'is-worked' : ''}`}
    >
      {/* queue line — always visible */}
      <div className="flex items-center gap-4 py-5 font-mono text-xs">
        <span className="text-faint">ALR-{project.id}</span>
        <span className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-700 ${
              worked ? 'bg-data' : sev.dot
            }`}
            aria-hidden
          />
          <span className={worked ? 'text-data' : sev.text}>{sev.label}</span>
        </span>
        <span
          className={`truncate font-display text-base font-semibold tracking-tight transition-colors duration-500 sm:text-lg ${
            worked ? 'text-fg' : 'text-muted'
          }`}
        >
          {project.title}
        </span>
        <span className="ml-auto hidden shrink-0 text-faint sm:block">{project.meta}</span>
        <span
          className={`shrink-0 transition-colors duration-700 ${
            worked ? 'text-data' : 'text-faint'
          }`}
        >
          {worked ? '● triaged' : '○ queued'}
        </span>
      </div>

      {/* case file — expands when the analyst (your scroll) reaches it */}
      <div className="case-body" aria-hidden={!worked}>
        <div className="min-h-0 overflow-hidden">
          <div className="grid gap-8 pb-8 pl-0 sm:pl-[4.5rem] lg:grid-cols-[1fr_minmax(0,22rem)]">
            <div>
              <p className="max-w-prose2 text-pretty text-sm leading-relaxed text-muted sm:text-base">
                {project.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {project.tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-5">
                {project.link ? (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={worked ? 0 : -1}
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
                    tabIndex={worked ? 0 : -1}
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
                    ruleOpen ? 'mt-5 grid-rows-[1fr]' : 'grid-rows-[0fr]'
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

            <div className="lg:border-l lg:border-hairline lg:pl-8">
              <p className="kicker mb-3">evidence</p>
              <ul className="space-y-2">
                {highlights.map((h) => (
                  <li key={h} className="flex gap-2.5 font-mono text-xs leading-relaxed text-muted">
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
    </li>
  )
}

/**
 * Selected Work as a triage queue: projects load as dim alert rows, and
 * scrolling works the queue — each row expands into its case file and flips
 * to "triaged". Reduced motion / no-JS-motion: everything ships expanded.
 */
export function Work() {
  const reduced = useReducedMotion()
  const ready = useMotionReady()
  const rows = useRef<(HTMLLIElement | null)[]>([])
  const animate = !reduced
  const [worked, setWorked] = useState<boolean[]>(() => PROJECTS.map(() => !animate))

  useGSAP(
    () => {
      if (!animate || !ready) return
      rows.current.forEach((el, i) => {
        if (!el) return
        ScrollTrigger.create({
          trigger: el,
          start: 'top 72%',
          once: true,
          onEnter: () =>
            setWorked((w) => {
              if (w[i]) return w
              const next = [...w]
              next[i] = true
              return next
            }),
        })
      })
    },
    { dependencies: [ready, animate] },
  )

  const openCount = worked.filter((x) => !x).length

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
            {openCount ? `queue: ${String(openCount).padStart(2, '0')} open` : 'queue clear'}
          </span>
          <span className="h-px flex-1 bg-hairline" />
        </div>

        <ol className="mt-4 border-t border-hairline">
          {PROJECTS.map((p, i) => (
            <CaseCard
              key={p.id}
              project={p}
              worked={worked[i]}
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
