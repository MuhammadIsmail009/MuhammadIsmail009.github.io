import { useRef } from 'react'
import { EXPERIENCE, CONTACT } from '@/lib/content'
import { Section, SectionHeader } from '@/components/ui'
import { useGSAP, ScrollTrigger } from '@/lib/gsap'
import { useReducedMotion } from '@/lib/useReducedMotion'

/** Experience as a git log — each role is a commit on the main branch. */
export function Experience() {
  const reduced = useReducedMotion()
  const list = useRef<HTMLOListElement>(null)

  // The branch line draws itself as the log scrolls through the viewport.
  useGSAP(
    () => {
      if (reduced || !list.current) return
      ScrollTrigger.create({
        trigger: list.current,
        start: 'top 78%',
        end: 'bottom 55%',
        scrub: 0.6,
        onUpdate: (self) =>
          list.current?.style.setProperty('--draw', self.progress.toFixed(3)),
      })
    },
    { dependencies: [reduced] },
  )

  return (
    <Section id="experience" className="py-section">
      <SectionHeader
        index="/ 05"
        label="Experience"
        title="Where I've done the work."
        className="mb-16"
      />

      <ol
        ref={list}
        className="exp-log relative ml-1 font-mono"
        style={{ '--draw': reduced ? 1 : 0 } as React.CSSProperties}
      >
        {EXPERIENCE.map((x, i) => {
          const current = /present/i.test(x.period)
          return (
            <li key={x.hash} className="relative pb-14 pl-8 last:pb-0" data-reveal>
              <span
                className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ${
                  current ? 'bg-accent shadow-[0_0_0_4px_rgba(240,133,58,0.12)]' : 'bg-muted'
                }`}
                aria-hidden
              />

              <p className="text-sm">
                <span className="text-accent">commit {x.hash}</span>
                {i === 0 ? <span className="text-data"> (HEAD → main)</span> : null}
                {current ? <span className="text-faint"> · active</span> : null}
              </p>
              <p className="mt-1 text-xs text-faint">
                Author: {`${CONTACT.githubLabel} <${CONTACT.email}>`}
              </p>
              <p className="text-xs text-faint">
                Date:&nbsp;&nbsp; {x.period} · {x.location}
              </p>

              <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight text-fg">
                {x.role}
              </h3>
              <p className="mt-1.5 text-sm text-accent">{x.org}</p>
              <p className="mt-3 max-w-prose2 text-pretty font-sans leading-relaxed text-muted">
                {x.summary}
              </p>
            </li>
          )
        })}
      </ol>
    </Section>
  )
}
