import {
  siSplunk,
  siElastic,
  siWireshark,
  siBurpsuite,
  siPython,
  siCplusplus,
  siTypescript,
  siGnubash,
  siTensorflow,
  siKalilinux,
  siLinux,
  siDocker,
  siK3s,
  siGithubactions,
  siReact,
  siNodedotjs,
  siPostgresql,
  type SimpleIcon,
} from 'simple-icons'
import { TOOLS, TRADECRAFT } from '@/lib/content'
import { Section, SectionHeader, Tag } from '@/components/ui'

const ICONS: Record<string, SimpleIcon> = {
  siSplunk,
  siElastic,
  siWireshark,
  siBurpsuite,
  siPython,
  siCplusplus,
  siTypescript,
  siGnubash,
  siTensorflow,
  siKalilinux,
  siLinux,
  siDocker,
  siK3s,
  siGithubactions,
  siReact,
  siNodedotjs,
  siPostgresql,
}

export function Stack() {
  return (
    <Section id="stack" className="py-section">
      <SectionHeader
        index="/ 06"
        label="Stack · Toolbelt"
        title="The tools I reach for."
        description="Blue-team first, with the ML, infra, and web range to build the whole thing."
        className="mb-14"
      />

      {/* instruments — the things with an install step */}
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6" role="list">
        {TOOLS.map((t) => {
          const icon = t.icon ? ICONS[t.icon] : undefined
          return (
            <li
              key={t.name}
              data-reveal
              className="group flex flex-col items-center gap-3 rounded-xl border border-hairline bg-surface/30 px-3 py-6 text-center transition-colors duration-300 hover:border-accent/40 hover:bg-surface/60"
              style={icon ? ({ '--brand': `#${icon.hex}` } as React.CSSProperties) : undefined}
            >
              {icon ? (
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7 fill-muted transition-colors duration-300 group-hover:fill-[var(--brand)]"
                  aria-hidden
                >
                  <path d={icon.path} />
                </svg>
              ) : (
                <span
                  className="flex h-7 items-center font-mono text-sm font-bold tracking-widest text-muted transition-colors duration-300 group-hover:text-accent"
                  aria-hidden
                >
                  {t.mono}
                </span>
              )}
              <span className="font-mono text-[0.68rem] leading-tight text-faint transition-colors duration-300 group-hover:text-fg">
                {t.name}
              </span>
            </li>
          )
        })}
      </ul>

      {/* tradecraft — the things with a discipline, not a download */}
      <div className="mt-12" data-reveal>
        <p className="kicker mb-5 text-accent/90">Tradecraft</p>
        <div className="flex flex-wrap gap-2">
          {TRADECRAFT.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      </div>
    </Section>
  )
}
