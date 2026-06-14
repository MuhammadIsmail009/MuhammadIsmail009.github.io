import { PROJECTS, type Project } from '@/lib/content'
import { SectionHeader, Tag } from '@/components/ui'

// Align the full-bleed track's first card with the centered container's left edge.
const TRACK_PADDING = {
  paddingLeft: 'max(clamp(1.25rem, 5vw, 4rem), calc((100vw - 80rem) / 2))',
  paddingRight: 'clamp(1.25rem, 5vw, 4rem)',
} as const

function WorkCard({ project }: { project: Project }) {
  return (
    <article
      data-work-card
      className="group relative flex w-[82vw] max-w-[28rem] shrink-0 snap-start flex-col justify-between rounded-2xl border border-hairline bg-surface/40 p-7 transition-colors duration-500 hover:border-accent/40 sm:w-[60vw] md:w-[44vw] lg:w-[28rem]"
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <span className="font-display text-7xl font-semibold leading-none text-faint/40 transition-colors duration-500 group-hover:text-accent/40">
            {project.id}
          </span>
          <span className="kicker mt-2 text-right">{project.meta}</span>
        </div>

        <h3 className="mt-7 font-display text-3xl font-semibold tracking-tight text-fg transition-colors duration-300 group-hover:text-accent">
          {project.title}
        </h3>
        <p className="mt-4 text-pretty text-sm leading-relaxed text-muted">{project.description}</p>
      </div>

      <div className="mt-8">
        <div className="flex flex-wrap gap-2">
          {project.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
        {project.link ? (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 font-mono text-xs text-fg transition-colors hover:text-accent"
          >
            {project.linkLabel}
            <span aria-hidden>↗</span>
          </a>
        ) : (
          <span className="mt-6 inline-flex items-center gap-2 font-mono text-xs text-faint">
            <span className="h-1.5 w-1.5 rounded-full bg-faint" aria-hidden />
            {project.linkLabel}
          </span>
        )}
      </div>
    </article>
  )
}

export function Work() {
  return (
    <section id="work" className="py-section" data-work>
      <div className="px-gutter">
        <div className="mx-auto max-w-content">
          <SectionHeader
            index="/ 02"
            label="Selected Work"
            title="Systems that watch the systems."
            description="Detection platforms, security research, and full-stack builds. Scroll the track — or jump to the repos."
          />
        </div>
      </div>

      <div
        data-work-track
        className="mt-14 flex gap-6 overflow-x-auto pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={TRACK_PADDING}
      >
        {PROJECTS.map((p) => (
          <WorkCard key={p.id} project={p} />
        ))}
      </div>
    </section>
  )
}
