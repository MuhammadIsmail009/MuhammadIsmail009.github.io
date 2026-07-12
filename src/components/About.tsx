import { ABOUT, IDENTITY } from '@/lib/content'
import { Section } from '@/components/ui'
import { Portrait } from '@/components/Portrait'

export function About() {
  return (
    <Section id="about" className="py-section">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="flex items-center gap-4" data-reveal>
            <span className="font-mono text-xs text-accent">/ 01</span>
            <span className="kicker">About</span>
          </div>
          <h2
            className="mt-8 font-display text-display-md font-semibold leading-[1.05] tracking-tight text-fg"
            data-split
          >
            {ABOUT.lead}
          </h2>
          <div className="mt-12 flex justify-center lg:mt-16 lg:justify-start" data-reveal>
            <Portrait />
          </div>
        </div>

        <div className="lg:col-span-7 lg:pt-16">
          {ABOUT.paragraphs.map((p, i) => (
            <p
              key={i}
              className="mb-6 text-pretty text-lg leading-relaxed text-muted last:mb-0 sm:text-xl"
              data-reveal
            >
              {p}
            </p>
          ))}

          {/* Identity card — quick-scan facts */}
          <dl
            className="relative mt-10 overflow-hidden rounded-xl border border-hairline bg-surface/40"
            data-reveal
          >
            <div className="border-b border-hairline px-5 py-3 font-mono text-xs text-faint">
              <span className="text-accent">$</span> whoami --long
            </div>
            {IDENTITY.map((row) => (
              <div
                key={row.k}
                className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-hairline px-5 py-3 last:border-b-0 sm:grid-cols-[9rem_1fr]"
              >
                <dt className="font-mono text-xs tracking-[0.08em] text-faint">
                  {row.k}
                </dt>
                <dd className="font-mono text-xs leading-relaxed text-muted">{row.v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap gap-3" data-reveal>
            <span className="kicker mr-1 self-center">Off the clock</span>
            {ABOUT.interests.map((x) => (
              <span
                key={x}
                className="rounded-full border border-hairline px-4 py-1.5 font-mono text-xs text-faint"
              >
                {x}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
