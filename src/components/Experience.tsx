import { EXPERIENCE, CONTACT } from '@/lib/content'
import { Section, SectionHeader } from '@/components/ui'

/** Experience as a git log — each role is a commit on the main branch. */
export function Experience() {
  return (
    <Section id="experience" className="py-section">
      <SectionHeader
        index="/ 05"
        label="Experience"
        title="Where I've done the work."
        className="mb-16"
      />

      <ol className="relative ml-1 border-l border-hairline font-mono">
        {EXPERIENCE.map((x, i) => (
          <li key={x.hash} className="relative pb-14 pl-8 last:pb-0" data-reveal>
            <span
              className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ${
                x.upcoming ? 'bg-accent shadow-[0_0_0_4px_rgba(240,133,58,0.12)]' : 'bg-muted'
              }`}
              aria-hidden
            />

            <p className="text-sm">
              <span className="text-accent">commit {x.hash}</span>
              {i === 0 ? <span className="text-data"> (HEAD → main)</span> : null}
              {x.upcoming ? <span className="text-faint"> · scheduled</span> : null}
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
        ))}
      </ol>
    </Section>
  )
}
