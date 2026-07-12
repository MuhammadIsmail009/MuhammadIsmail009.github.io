import { useEffect, useMemo, useRef, useState } from 'react'
import { CONTACT, PROJECTS, SECTION_INDEX } from '@/lib/content'
import { scrollTo } from '@/lib/scroll'

interface Action {
  id: string
  label: string
  hint: string
  /** invisible search keywords */
  kw?: string
  run: () => void
}

/** Simple ranked match: substring first, then in-order character subsequence. */
function score(a: Action, q: string): number {
  if (!q) return 1
  const s = `${a.label} ${a.hint} ${a.kw ?? ''}`.toLowerCase()
  if (s.includes(q)) return 2
  let i = 0
  for (const ch of s) {
    if (ch === q[i]) i++
    if (i === q.length) return 1
  }
  return 0
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const [toast, setToast] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)
  const toastT = useRef<number>()

  const notify = (msg: string) => {
    setToast(msg)
    window.clearTimeout(toastT.current)
    toastT.current = window.setTimeout(() => setToast(''), 1600)
  }

  // Don't leave a toast timer running past unmount.
  useEffect(() => () => window.clearTimeout(toastT.current), [])

  const actions = useMemo<Action[]>(
    () => [
      ...SECTION_INDEX.filter((s) => s.id !== 'hero').map((s) => ({
        id: `go-${s.id}`,
        label: `Jump to ${s.label}`,
        hint: 'section',
        run: () => scrollTo(`#${s.id}`),
      })),
      ...PROJECTS.filter((p) => p.link).map((p) => ({
        id: `repo-${p.id}`,
        label: `${p.title} — source`,
        hint: 'repo',
        kw: 'project code github',
        run: () => window.open(p.link!, '_blank', 'noopener'),
      })),
      {
        id: 'cv',
        label: 'Read my CV',
        hint: 'pdf',
        kw: 'resume download curriculum',
        run: () => window.open('/Muhammad-Ismail-Resume.pdf', '_blank', 'noopener'),
      },
      {
        id: 'copy-email',
        label: 'Copy email',
        hint: CONTACT.email,
        kw: 'contact mail address',
        run: () =>
          void navigator.clipboard
            ?.writeText(CONTACT.email)
            .then(() => notify('copied to clipboard'))
            .catch(() => {}),
      },
      {
        id: 'github',
        label: 'GitHub profile',
        hint: CONTACT.githubLabel,
        run: () => window.open(CONTACT.github, '_blank', 'noopener'),
      },
      {
        id: 'linkedin',
        label: 'LinkedIn profile',
        hint: CONTACT.linkedinLabel,
        kw: 'connect network',
        run: () => window.open(CONTACT.linkedin, '_blank', 'noopener'),
      },
      {
        id: 'triage',
        label: 'Triage Rush — work a shift',
        hint: 'mini game',
        kw: 'game play fun soc alerts shift',
        run: () => window.dispatchEvent(new CustomEvent('triage:open')),
      },
      {
        id: 'page',
        label: 'Page the on-call analyst',
        hint: 'opens mail',
        kw: 'hire job internship recruit contact reach out escalate',
        run: () => {
          window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent('Paging Ismail — got a minute?')}`
        },
      },
    ],
    [],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return actions
    return actions
      .map((a) => [score(a, q), a] as const)
      .filter(([s]) => s > 0)
      .sort((a, b) => b[0] - a[0])
      .map(([, a]) => a)
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

  // Open: remember the invoker, lock background scroll, focus the input.
  // Close: restore both.
  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement as HTMLElement | null
    document.documentElement.style.overflow = 'hidden'
    setQuery('')
    setCursor(0)
    requestAnimationFrame(() => inputRef.current?.focus())
    return () => {
      document.documentElement.style.overflow = ''
      restoreRef.current?.focus?.()
    }
  }, [open])

  // Keep keyboard focus inside the dialog while it's open.
  useEffect(() => {
    if (!open) return
    const onTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const items = Array.from(
        panel.querySelectorAll<HTMLElement>('input, button:not([disabled])'),
      ).filter((el) => el.offsetParent !== null)
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
    window.addEventListener('keydown', onTab)
    return () => window.removeEventListener('keydown', onTab)
  }, [open])

  useEffect(() => setCursor(0), [query])

  const toastEl = toast ? (
    <div className="fixed bottom-8 left-1/2 z-[270] -translate-x-1/2 rounded-full border border-accent/40 bg-canvas/90 px-5 py-2 font-mono text-xs text-accent shadow-lg backdrop-blur-sm">
      {toast}
    </div>
  ) : null

  if (!open) return toastEl

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
    <>
    {toastEl}
    <div
      className="fixed inset-0 z-[250] flex items-start justify-center bg-black/60 px-4 pt-[16vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        ref={panelRef}
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

        <ul className="max-h-[46vh] overflow-y-auto py-2" role="listbox">
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
    </>
  )
}
