import type { ReactNode, MouseEvent } from 'react'
import { scrollTo } from '@/lib/scroll'

export function Section({
  id,
  className = '',
  children,
}: {
  id?: string
  className?: string
  children: ReactNode
}) {
  return (
    <section id={id} className={`relative px-gutter ${className}`}>
      <div className="mx-auto w-full max-w-content">{children}</div>
    </section>
  )
}

export function SectionHeader({
  index,
  label,
  title,
  description,
  className = '',
}: {
  index: string
  label: string
  title: ReactNode
  description?: string
  className?: string
}) {
  return (
    <header className={className}>
      <div className="flex items-center gap-4" data-reveal>
        <span className="font-mono text-xs text-accent">{index}</span>
        <span className="kicker">{label}</span>
      </div>
      <h2
        className="mt-6 max-w-prose2 font-display text-display-md font-semibold tracking-tight text-fg"
        data-split
      >
        {title}
      </h2>
      {description ? (
        <p
          className="mt-5 max-w-prose2 text-pretty text-base leading-relaxed text-muted sm:text-lg"
          data-reveal
        >
          {description}
        </p>
      ) : null}
    </header>
  )
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-hairline bg-surface/50 px-3 py-1 font-mono text-[0.7rem] leading-none text-muted transition-colors duration-300 hover:border-accent/40 hover:text-fg">
      {children}
    </span>
  )
}

export function ButtonLink({
  children,
  href,
  variant = 'primary',
  className = '',
  download,
  icon = '→',
}: {
  children: ReactNode
  href: string
  variant?: 'primary' | 'ghost'
  className?: string
  /** Filename to save as; when set the link downloads instead of navigating. */
  download?: string
  /** Trailing glyph. Defaults to a forward arrow; pass '↓' for downloads. */
  icon?: ReactNode
}) {
  const isAnchor = href.startsWith('#')
  const isMail = href.startsWith('mailto:')
  const external = !isAnchor && !isMail && !download

  const base =
    'group relative inline-flex items-center gap-2 rounded-full px-6 py-3 font-mono text-sm tracking-wide transition-colors duration-300'
  const styles =
    variant === 'primary'
      ? 'bg-accent text-canvas shadow-[0_0_24px_-6px_rgba(142,158,196,0.55)] transition-shadow hover:bg-accent-soft hover:shadow-[0_0_34px_-4px_rgba(142,158,196,0.65)]'
      : 'border border-hairline text-fg hover:border-accent/50 hover:text-accent'

  // The trailing arrow slides right on hover; a download glyph reads better
  // nudging down.
  const iconHover = icon === '↓' ? 'group-hover:translate-y-0.5' : 'group-hover:translate-x-1'

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (isAnchor) {
      e.preventDefault()
      scrollTo(href)
    }
  }

  return (
    <a
      href={href}
      onClick={onClick}
      download={download}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`${base} ${styles} ${className}`}
      data-magnetic
    >
      {children}
      <span className={`transition-transform duration-300 ${iconHover}`} aria-hidden>
        {icon}
      </span>
    </a>
  )
}
