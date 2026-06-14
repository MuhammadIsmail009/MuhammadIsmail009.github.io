import { ABOUT } from '@/lib/content'
import { Section } from '@/components/ui'
import { HackerArt } from '@/components/HackerArt'

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
            <HackerArt />
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
