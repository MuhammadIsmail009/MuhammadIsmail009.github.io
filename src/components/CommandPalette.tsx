import { useEffect, useMemo, useRef, useState } from 'react'
import { CONTACT, SECTION_INDEX } from '@/lib/content'
import { scrollTo } from '@/lib/scroll'

interface Action {
  id: string
  label: string
  hint: string
  run: () => void
}

/** Fired by the palette / nav / terminal to boot the SOC workstation. */
export const SOC_BOOT_EVENT = 'soc:boot'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const actions = useMemo<Action[]>(
    () => [
      ...SECTION_INDEX.filter((s) => s.id !== 'hero').map((s) => ({
        id: `go-${s.id}`,
        label: `Go to ${s.label}`,
        hint: 'section',
        run: () => scrollTo(`#${s.id}`),
      })),
      {
        id: 'soc',
        label: 'Boot ISMAIL SOC',
        hint: 'the fun part',
        run: () => window.dispatchEvent(new CustomEvent(SOC_BOOT_EVENT)),
      },
      {
        id: 'cv',
        label: 'View CV',
        hint: 'pdf',
        run: () => window.open('/Muhammad-Ismail-Resume.pdf', '_blank', 'noopener'),
      },
      {
        id: 'copy-email',
        label: 'Copy email address',
        hint: CONTACT.email,
        run: () => void navigator.clipboard?.writeText(CONTACT.email).catch(() => {}),
      },
      {
        id: 'github',
        label: 'Open GitHub',
        hint: CONTACT.githubLabel,
        run: () => window.open(CONTACT.github, '_blank', 'noopener'),
      },
      {
        id: 'linkedin',
        label: 'Open LinkedIn',
        hint: CONTACT.linkedinLabel,
        run: () => window.open(CONTACT.linkedin, '_blank', 'noopener'),
      },
    ],
    [],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return actions
    return actions.filter(
      (a) => a.label.toLowerCase().includes(q) || a.hint.toLowerCase().includes(q),
    )
  }, [actions, query])

  // Global shortcut.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    const onOpen = () => setOpen(true)
    window.addEventListener('palette:open', onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('palette:open', onOpen)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setCursor(0)
      // Focus after the element exists.
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => setCursor(0), [query])

  if (!open) return null

  const exec = (a: Action) => {
    setOpen(false)
    a.run()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => Math.min(c + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => Math.max(c - 1, 0))
    } else if (e.key === 'Enter' && filtered[cursor]) {
      e.preventDefault()
      exec(filtered[cursor])
    }
  }

  return (
    <div
      className="fixed inset-0 z-[250] flex items-start justify-center bg-black/60 px-4 pt-[16vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl border border-hairline bg-surface shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-hairline px-4 py-3">
          <span className="font-mono text-xs text-accent" aria-hidden>
            ❯
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a command…"
            className="w-full bg-transparent font-mono text-sm text-fg placeholder:text-faint caret-accent outline-none"
            aria-label="Search commands"
          />
          <kbd className="rounded border border-hairline px-1.5 py-0.5 font-mono text-[0.6rem] text-faint">
            esc
          </kbd>
        </div>

        <ul ref={listRef} className="max-h-[46vh] overflow-y-auto py-2" role="listbox">
          {filtered.length === 0 ? (
            <li className="px-4 py-3 font-mono text-sm text-faint">no matches — try 'work'</li>
          ) : (
            filtered.map((a, i) => (
              <li key={a.id} role="option" aria-selected={i === cursor}>
                <button
                  type="button"
                  onClick={() => exec(a)}
                  onMouseEnter={() => setCursor(i)}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left font-mono text-sm transition-colors ${
                    i === cursor ? 'bg-accent/10 text-fg' : 'text-muted'
                  }`}
                >
                  <span>
                    {i === cursor ? <span className="mr-2 text-accent">›</span> : <span className="mr-2 opacity-0">›</span>}
                    {a.label}
                  </span>
                  <span className="ml-4 truncate text-[0.65rem] text-faint">{a.hint}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
