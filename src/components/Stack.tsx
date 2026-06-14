import { STACK_GROUPS } from '@/lib/content'
import { Section, SectionHeader, Tag } from '@/components/ui'

export function Stack() {
  return (
    <Section id="stack" className="py-section">
      <SectionHeader
        index="/ 04"
        label="Stack · Toolbelt"
        title="The tools I reach for."
        description="Blue-team first, with the ML, infra, and web range to build the whole thing."
        className="mb-16"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STACK_GROUPS.map((g) => (
          <div
            key={g.label}
            className="rounded-2xl border border-hairline bg-surface/30 p-7 transition-colors duration-500 hover:border-accent/30"
            data-reveal
          >
            <h3 className="kicker mb-5 text-accent/90">{g.label}</h3>
            <div className="flex flex-wrap gap-2">
              {g.items.map((i) => (
                <Tag key={i}>{i}</Tag>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
