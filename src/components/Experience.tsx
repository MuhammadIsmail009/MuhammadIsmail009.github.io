import { EXPERIENCE } from '@/lib/content'
import { Section, SectionHeader } from '@/components/ui'

export function Experience() {
  return (
    <Section id="experience" className="py-section">
      <SectionHeader
        index="/ 03"
        label="Experience"
        title="Where I've done the work."
        className="mb-16"
      />

      <ol className="relative ml-1 border-l border-hairline">
        {EXPERIENCE.map((x) => (
          <li key={`${x.role}-${x.org}`} className="relative pb-12 pl-8 last:pb-0" data-reveal>
            <span
              className={`absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full ${
                x.upcoming ? 'bg-accent shadow-[0_0_0_4px_rgba(240,133,58,0.12)]' : 'bg-muted'
              }`}
              aria-hidden
            />
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="font-display text-2xl font-semibold tracking-tight text-fg">{x.role}</h3>
              <span className="font-mono text-xs text-faint">{x.period}</span>
            </div>
            <p className="mt-1.5 font-mono text-sm text-accent">{x.org}</p>
            <p className="mt-3 max-w-prose2 text-pretty leading-relaxed text-muted">{x.summary}</p>
            {x.upcoming ? (
              <span className="mt-4 inline-block rounded-full border border-accent/40 px-3 py-1 font-mono text-[0.7rem] text-accent">
                Incoming
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </Section>
  )
}
