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
}: {
  children: ReactNode
  href: string
  variant?: 'primary' | 'ghost'
  className?: string
}) {
  const isAnchor = href.startsWith('#')
  const isMail = href.startsWith('mailto:')
  const external = !isAnchor && !isMail

  const base =
    'group relative inline-flex items-center gap-2 rounded-full px-6 py-3 font-mono text-sm tracking-wide transition-colors duration-300'
  const styles =
    variant === 'primary'
      ? 'bg-accent text-canvas hover:bg-accent-soft'
      : 'border border-hairline text-fg hover:border-accent/50 hover:text-accent'

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
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`${base} ${styles} ${className}`}
      data-magnetic
    >
      {children}
      <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
        →
      </span>
    </a>
  )
}
