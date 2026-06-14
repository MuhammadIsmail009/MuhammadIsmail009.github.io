import { STATS } from '@/lib/content'
import { Section } from '@/components/ui'

export function Stats() {
  return (
    <Section className="pb-section">
      <div className="grid grid-cols-2 gap-x-6 gap-y-12 border-t border-hairline pt-14 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} data-reveal>
            <div
              className="font-display text-5xl font-semibold tabular-nums text-fg sm:text-6xl"
              data-counter
              data-value={s.value}
              data-pad={s.pad2 ? '2' : '0'}
            >
              {s.pad2 ? String(s.value).padStart(2, '0') : s.value}
            </div>
            <div className="mt-3 max-w-[18ch] font-mono text-xs leading-relaxed text-muted">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
