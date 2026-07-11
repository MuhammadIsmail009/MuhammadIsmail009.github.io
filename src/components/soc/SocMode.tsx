import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { CONTACT, PROJECTS, SOC, SITE } from '@/lib/content'
import { useClock } from '@/lib/useClock'
import { BootLog } from '@/components/soc/BootLog'
import { WindowFrame } from '@/components/soc/WindowFrame'
import { DefenseGame } from '@/components/soc/DefenseGame'
import { TerminalShell } from '@/components/Terminal'

type AppId = 'readme' | 'terminal' | 'defend' | 'work' | 'contact'

interface AppDef {
  id: AppId
  title: string
  icon: string
  label: string
  width?: string
  render: () => ReactNode
}

function Readme() {
  return (
    <div className="p-5 font-mono text-sm leading-relaxed">
      {SOC.readme.map((l, i) =>
        l === '' ? (
          <br key={i} />
        ) : (
          <p key={i} className={i === 0 ? 'text-fg' : 'text-muted'}>
            {l}
          </p>
        ),
      )}
    </div>
  )
}

function WorkList() {
  return (
    <ul className="divide-y divide-hairline">
      {PROJECTS.map((p) => (
        <li key={p.id}>
          <a
            href={p.link ?? CONTACT.github}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-baseline gap-4 px-5 py-3.5 transition-colors hover:bg-accent/5"
          >
            <span className="font-mono text-xs text-accent">{p.id}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-display text-base font-semibold text-fg transition-colors group-hover:text-accent">
                {p.title}
              </span>
              <span className="block truncate font-mono text-[0.68rem] text-faint">{p.meta} · {p.tags.slice(0, 4).join(' · ')}</span>
            </span>
            <span className="font-mono text-xs text-faint transition-colors group-hover:text-accent" aria-hidden>
              ↗
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}

function ContactCard() {
  return (
    <div className="space-y-3 p-5 font-mono text-sm">
      <p className="text-faint"># contact.vcf</p>
      <p>
        <span className="text-data">email </span>
        <a href={`mailto:${CONTACT.email}`} className="text-fg underline decoration-hairline underline-offset-4 hover:text-accent">
          {CONTACT.email}
        </a>
      </p>
      <p>
        <span className="text-data">github </span>
        <a href={CONTACT.github} target="_blank" rel="noopener noreferrer" className="text-fg underline decoration-hairline underline-offset-4 hover:text-accent">
          {CONTACT.githubLabel}
        </a>
      </p>
      <p>
        <span className="text-data">linkedin&nbsp;&nbsp;</span>
        <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" className="text-fg underline decoration-hairline underline-offset-4 hover:text-accent">
          {CONTACT.linkedinLabel}
        </a>
      </p>
      <p>
        <span className="text-data">cv </span>
        <a href="/Muhammad-Ismail-Resume.pdf" target="_blank" rel="noopener" className="text-fg underline decoration-hairline underline-offset-4 hover:text-accent">
          Muhammad-Ismail-Resume.pdf
        </a>
      </p>
      <p className="pt-2 text-faint">status: open to Summer ’26 internships.</p>
    </div>
  )
}

const APPS: AppDef[] = [
  { id: 'readme', title: 'README.txt', icon: '👤', label: 'README.txt', render: () => <Readme /> },
  {
    id: 'terminal',
    title: 'kryptctl — bash',
    icon: '❯_',
    label: 'kryptctl',
    render: () => <TerminalShell heightClass="h-full min-h-[16rem]" />,
  },
  {
    id: 'defend',
    title: 'defend.sh — live',
    icon: '◎',
    label: 'defend.sh',
    width: 'min(56rem, 94vw)',
    render: () => <DefenseGame />,
  },
  { id: 'work', title: 'work/', icon: '▤', label: 'work/', render: () => <WorkList /> },
  { id: 'contact', title: 'contact.vcf', icon: '✉', label: 'contact.vcf', render: () => <ContactCard /> },
]

/**
 * ISMAIL SOC — the site rebooted as an analyst workstation. Boot log, then a
 * desktop of draggable windows. Rendered in a portal-free fixed overlay; the
 * page behind keeps its state.
 */
export default function SocMode({ onExit }: { onExit: () => void }) {
  const clock = useClock()
  const [booted, setBooted] = useState(false)
  const [open, setOpen] = useState<AppId[]>([])
  const [zOrder, setZOrder] = useState<AppId[]>([])

  // Lock page scroll while the workstation is up.
  useEffect(() => {
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = prev
    }
  }, [])

  // Escape closes the top window; with nothing open it exits the workstation.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !booted) return
      if (open.length) {
        const top = zOrder[zOrder.length - 1] ?? open[open.length - 1]
        setOpen((o) => o.filter((x) => x !== top))
        setZOrder((z) => z.filter((x) => x !== top))
      } else {
        onExit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [booted, open, zOrder, onExit])

  const launch = (id: AppId) => {
    setOpen((o) => (o.includes(id) ? o : [...o, id]))
    setZOrder((z) => [...z.filter((x) => x !== id), id])
  }
  const close = (id: AppId) => {
    setOpen((o) => o.filter((x) => x !== id))
    setZOrder((z) => z.filter((x) => x !== id))
  }
  const focus = (id: AppId) => setZOrder((z) => (z[z.length - 1] === id ? z : [...z.filter((x) => x !== id), id]))

  // Open the welcome window once the desktop lands.
  useEffect(() => {
    if (booted) launch('readme')
  }, [booted])

  const grid = useMemo(
    () => ({
      backgroundImage:
        'linear-gradient(rgb(240 133 58 / 0.05) 1px, transparent 1px), linear-gradient(90deg, rgb(240 133 58 / 0.05) 1px, transparent 1px)',
      backgroundSize: '48px 48px',
    }),
    [],
  )

  return (
    <div className="fixed inset-0 z-[300] bg-[#080706]" role="dialog" aria-modal="true" aria-label="ISMAIL SOC workstation">
      {!booted ? (
        <BootLog onDone={() => setBooted(true)} />
      ) : (
        <div className="scanlines relative flex h-full flex-col" style={grid}>
          {/* vignette */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(120% 90% at 50% 110%, rgba(240,133,58,0.10), transparent 55%)' }}
          />

          {/* Menu bar */}
          <header className="relative z-[5] flex items-center gap-5 border-b border-hairline bg-[#0a0908]/90 px-4 py-2 font-mono text-xs">
            <span className="font-bold text-fg">
              ▲ <span className="text-accent">ISMAIL</span> SOC
            </span>
            <span className="hidden text-faint sm:inline">{SOC.osName}</span>
            <span className="ml-auto tabular-nums text-faint">
              {clock} {SITE.timezoneLabel}
            </span>
            <button
              type="button"
              onClick={onExit}
              className="rounded border border-hairline px-2.5 py-1 uppercase tracking-[0.12em] text-muted transition-colors hover:border-accent/60 hover:text-accent"
            >
              ⏻ Exit to site
            </button>
          </header>

          {/* Desktop icons */}
          <div className="relative z-[2] flex flex-1 items-start p-5">
            <div className="grid grid-cols-1 gap-5">
              {APPS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onDoubleClick={() => launch(a.id)}
                  onClick={(e) => {
                    // Single tap launches on touch; double-click on desktop.
                    if (e.detail === 1 && window.matchMedia('(pointer: coarse)').matches) launch(a.id)
                  }}
                  className="group flex w-20 flex-col items-center gap-1.5"
                  aria-label={`Open ${a.label}`}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-hairline bg-surface/50 font-mono text-lg text-accent transition-all duration-200 group-hover:border-accent/60 group-hover:bg-accent/10">
                    {a.icon}
                  </span>
                  <span className="font-mono text-[0.65rem] text-muted">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Windows */}
          <div className="pointer-events-none absolute inset-0 z-[10]">
            {open.map((id) => {
              const app = APPS.find((a) => a.id === id)!
              return (
                <WindowFrame
                  key={id}
                  title={app.title}
                  slot={APPS.findIndex((a) => a.id === id)}
                  z={20 + zOrder.indexOf(id)}
                  width={app.width}
                  onClose={() => close(id)}
                  onFocus={() => focus(id)}
                >
                  {app.render()}
                </WindowFrame>
              )
            })}
          </div>

          {/* Dock */}
          <footer className="relative z-[15] flex justify-center pb-4">
            <div className="glass flex items-center gap-2 rounded-2xl px-3 py-2">
              {APPS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => launch(a.id)}
                  className={`relative flex h-11 w-11 items-center justify-center rounded-xl border font-mono text-base transition-all duration-200 hover:-translate-y-0.5 ${
                    open.includes(a.id)
                      ? 'border-accent/50 bg-accent/10 text-accent'
                      : 'border-hairline text-muted hover:border-accent/40 hover:text-accent'
                  }`}
                  aria-label={`Open ${a.label}`}
                >
                  {a.icon}
                  {open.includes(a.id) ? (
                    <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-accent" aria-hidden />
                  ) : null}
                </button>
              ))}
            </div>
          </footer>
        </div>
      )}
    </div>
  )
}
