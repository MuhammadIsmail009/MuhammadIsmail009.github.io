import { APPROACH } from '@/lib/content'
import { Section, SectionHeader } from '@/components/ui'
import { ApproachPipeline } from '@/components/ApproachPipeline'

/** Methodology — how the work gets done, in four numbered moves. */
export function Approach() {
  return (
    <Section id="approach" className="py-section">
      <SectionHeader
        index="/ 02"
        label={APPROACH.kicker}
        title={APPROACH.title}
        className="mb-16"
      />

      {/* live pipeline — the event rides the wire and lights each gate below */}
      <ApproachPipeline />

      <ol className="grid gap-px overflow-hidden rounded-xl border border-hairline bg-hairline sm:grid-cols-2 xl:grid-cols-4">
        {APPROACH.steps.map((s) => (
          <li
            key={s.n}
            className="group relative bg-canvas p-7 sm:p-8"
            data-reveal
            data-approach-step
          >
            <span
              className="font-display text-5xl font-semibold text-surface-2 transition-colors duration-500 group-hover:text-accent/25"
              aria-hidden
            >
              {s.n}
            </span>
            <h3 className="mt-5 font-display text-xl font-semibold tracking-tight text-fg">
              <span className="mr-2 font-mono text-xs text-accent" aria-hidden>
                ▸
              </span>
              {s.title}
            </h3>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-muted">{s.body}</p>
            <span
              className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-500 ease-expo group-hover:scale-x-100"
              aria-hidden
            />
          </li>
        ))}
      </ol>
    </Section>
  )
}
