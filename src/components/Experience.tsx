import { EXPERIENCE } from '@/lib/content'
import { Section, SectionHeader } from '@/components/ui'

/** Experience as a duty record — period on the rail, role on the sheet. */
export function Experience() {
  return (
    <Section id="experience" className="py-section">
      <SectionHeader
        index="/ 05"
        label="Experience"
        title="Where I've done the work."
        className="mb-16"
      />

      <ol className="divide-y divide-hairline border-y border-hairline">
        {EXPERIENCE.map((x) => {
          const current = /present/i.test(x.period)
          return (
            <li
              key={`${x.org}-${x.period}`}
              className="grid gap-3 py-9 md:grid-cols-[15rem_1fr] md:gap-10"
              data-reveal
            >
              <div className="font-mono text-xs leading-relaxed text-faint">
                <p className={current ? 'text-accent' : undefined}>{x.period}</p>
                <p className="mt-1">{x.location}</p>
                {current ? (
                  <p className="mt-3 flex items-center gap-2 text-[0.65rem] tracking-[0.15em]">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                    </span>
                    ACTIVE
                  </p>
                ) : null}
              </div>

              <div>
                <h3 className="font-display text-2xl font-semibold tracking-tight text-fg">
                  {x.role}
                </h3>
                <p className="mt-1.5 font-mono text-sm text-accent">{x.org}</p>
                <p className="mt-3 max-w-prose2 text-pretty leading-relaxed text-muted">
                  {x.summary}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </Section>
  )
}
