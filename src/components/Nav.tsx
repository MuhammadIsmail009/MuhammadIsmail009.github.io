import { useEffect, useRef, useState } from 'react'
import { NAV, CONTACT } from '@/lib/content'
import { scrollTo } from '@/lib/scroll'

function Monogram() {
  return (
    <a
      href="#hero"
      onClick={(e) => {
        e.preventDefault()
        scrollTo('#hero', { offset: 0 })
      }}
      className="flex items-center gap-1 font-mono text-sm font-bold tracking-tight text-fg"
      aria-label="Muhammad Ismail — home"
    >
      <span>MI</span>
      <span className="text-accent" aria-hidden>
        _
      </span>
    </a>
  )
}

export function Nav() {
  const [open, setOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // lock body scroll while the mobile overlay is open
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [open])

  // Focus management + trap while the overlay is open.
  useEffect(() => {
    if (!open) return

    // move focus into the menu
    menuRef.current?.querySelector<HTMLElement>('a')?.focus()

    const focusables = () =>
      Array.from(
        headerRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
      ).filter((el) => el.offsetParent !== null)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (href: string) => {
    setOpen(false)
    scrollTo(href)
  }

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-[100] px-gutter pt-3 sm:pt-4" data-nav>
      <nav
        className="glass mx-auto flex max-w-content items-center justify-between rounded-full px-4 py-2.5 sm:px-6 sm:py-3"
        aria-label="Primary"
      >
        <Monogram />

        <ul className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <li key={n.href}>
              <a
                href={n.href}
                onClick={(e) => {
                  e.preventDefault()
                  go(n.href)
                }}
                className="group relative font-mono text-sm text-muted transition-colors duration-300 hover:text-fg"
                data-magnetic
              >
                <span>{n.label}</span>
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2.5 md:flex">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('palette:open'))}
            className="rounded-full border border-hairline px-3 py-1.5 font-mono text-xs text-muted transition-colors duration-300 hover:border-accent/50 hover:text-accent"
            aria-label="Open command palette"
            data-magnetic
          >
            ⌘K
          </button>
          <a
            href={`mailto:${CONTACT.email}`}
            className="rounded-full border border-hairline px-4 py-1.5 font-mono text-xs text-fg transition-colors duration-300 hover:border-accent/50 hover:text-accent"
            data-magnetic
          >
            Let’s talk
          </a>
        </div>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex h-9 w-9 items-center justify-center md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <span className="relative block h-3 w-5">
            <span
              className={`absolute left-0 block h-px w-5 bg-fg transition-all duration-300 ${
                open ? 'top-1.5 rotate-45' : 'top-0'
              }`}
            />
            <span
              className={`absolute left-0 top-1.5 block h-px w-5 bg-fg transition-all duration-300 ${
                open ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`absolute left-0 block h-px w-5 bg-fg transition-all duration-300 ${
                open ? 'top-1.5 -rotate-45' : 'top-3'
              }`}
            />
          </span>
        </button>
      </nav>

      {/* Mobile full-screen overlay */}
      <div
        ref={menuRef}
        id="mobile-menu"
        aria-hidden={!open}
        className={`fixed inset-0 z-[-1] flex flex-col justify-center bg-canvas px-gutter transition-opacity duration-500 md:hidden ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <ul className="flex flex-col gap-2">
          {NAV.map((n, i) => (
            <li key={n.href}>
              <a
                href={n.href}
                tabIndex={open ? 0 : -1}
                onClick={(e) => {
                  e.preventDefault()
                  go(n.href)
                }}
                className="flex items-baseline gap-4 py-2 font-display text-5xl font-semibold text-fg transition-colors hover:text-accent"
              >
                <span className="font-mono text-sm text-accent">0{i + 1}</span>
                {n.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href={`mailto:${CONTACT.email}`}
          tabIndex={open ? 0 : -1}
          className="mt-10 font-mono text-sm text-muted transition-colors hover:text-accent"
        >
          {CONTACT.email}
        </a>
      </div>
    </header>
  )
}
