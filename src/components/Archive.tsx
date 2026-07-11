import { ARCHIVE, CONTACT } from '@/lib/content'
import { Section, SectionHeader } from '@/components/ui'

/** The smaller builds — a compact ledger under the hero projects. */
export function Archive() {
  return (
    <Section id="archive" className="py-section">
      <SectionHeader index="/ 04" label="Archive" title="More from the lab." className="mb-14" />

      <ul className="border-t border-hairline">
        {ARCHIVE.map((item) => {
          const inner = (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-lg font-semibold tracking-tight text-fg transition-colors duration-300 group-hover:text-accent sm:text-xl">
                  {item.title}
                </span>
                <span className="mt-0.5 block font-mono text-xs text-faint sm:hidden">
                  {item.meta}
                </span>
              </span>
              <span className="hidden font-mono text-xs text-faint sm:block sm:w-44">
                {item.meta}
              </span>
              <span className="hidden min-w-0 flex-1 truncate font-mono text-xs text-muted lg:block">
                {item.tags}
              </span>
              <span className="flex w-20 items-center justify-end gap-2 font-mono text-xs tabular-nums text-faint">
                {item.year}
                <span
                  className={`transition-all duration-300 ${
                    item.link
                      ? 'text-accent opacity-0 group-hover:translate-x-0.5 group-hover:opacity-100'
                      : 'opacity-0'
                  }`}
                  aria-hidden
                >
                  ↗
                </span>
              </span>
            </>
          )
          const cls =
            'group flex items-center gap-4 border-b border-hairline py-5 transition-colors duration-300'
          return (
            <li key={item.title} data-reveal>
              {item.link ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${cls} hover:bg-surface/40`}
                  data-cursor-label="VIEW"
                >
                  {inner}
                </a>
              ) : (
                <div className={cls}>{inner}</div>
              )}
            </li>
          )
        })}
      </ul>

      <p className="mt-8 font-mono text-sm text-faint" data-reveal>
        Everything else lives on GitHub —{' '}
        <a
          href={CONTACT.github}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted underline decoration-hairline underline-offset-4 transition-colors hover:text-accent"
        >
          github.com/{CONTACT.githubLabel}
        </a>
      </p>
    </Section>
  )
}
