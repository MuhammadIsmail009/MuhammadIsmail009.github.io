import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Section, SectionHeader } from '@/components/ui'
import { TERMINAL_COMMANDS, TERMINAL_INTRO, TERMINAL_PROMPT } from '@/lib/content'
import { SOC_BOOT_EVENT } from '@/components/CommandPalette'

interface Line {
  kind: 'in' | 'out'
  text: string
}

const intro = (): Line[] => TERMINAL_INTRO.map((text) => ({ kind: 'out', text }))

/**
 * The interactive shell itself — reused by the on-page section and by the
 * SOC-mode terminal window. `heightClass` sizes the scrollback area.
 */
export function TerminalShell({ heightClass = 'h-[clamp(280px,40vh,420px)]' }: { heightClass?: string }) {
  const [history, setHistory] = useState<Line[]>(intro)
  const [value, setValue] = useState('')
  const [past, setPast] = useState<string[]>([])
  const [pastIdx, setPastIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputId = useId()

  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [history])

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase()
    if (cmd) setPast((p) => [...p, raw])
    setPastIdx(-1)

    if (cmd === 'clear') {
      setHistory([])
      return
    }
    const next: Line[] = [{ kind: 'in', text: raw }]
    if (cmd) {
      // Own-property check only — otherwise "constructor", "__proto__", "toString"
      // etc. resolve to prototype members (truthy) and crash on `.out`.
      const found = Object.prototype.hasOwnProperty.call(TERMINAL_COMMANDS, cmd)
        ? TERMINAL_COMMANDS[cmd]
        : undefined
      if (found) next.push(...found.out.map((text) => ({ kind: 'out' as const, text })))
      else next.push({ kind: 'out', text: `command not found: ${cmd} — try 'help'` })
    }
    setHistory((h) => [...h, ...next])

    // `soc` boots the workstation (after the output has a beat to land).
    if (cmd === 'soc') {
      window.setTimeout(() => window.dispatchEvent(new CustomEvent(SOC_BOOT_EVENT)), 450)
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    run(value)
    setValue('')
  }

  // up/down through command history
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!past.length) return
      const idx = pastIdx < 0 ? past.length - 1 : Math.max(0, pastIdx - 1)
      setPastIdx(idx)
      setValue(past[idx])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (pastIdx < 0) return
      const idx = pastIdx + 1
      if (idx >= past.length) {
        setPastIdx(-1)
        setValue('')
      } else {
        setPastIdx(idx)
        setValue(past[idx])
      }
    }
  }

  return (
    <div
      ref={bodyRef}
      className={`${heightClass} overflow-y-auto p-4 font-mono text-sm leading-relaxed`}
      onClick={() => inputRef.current?.focus()}
    >
      {history.map((l, i) => (
        <div key={i} className={l.kind === 'in' ? 'text-fg' : 'text-muted'}>
          {l.kind === 'in' ? <span className="text-accent">{TERMINAL_PROMPT} </span> : null}
          <span className="whitespace-pre-wrap break-words">{l.text}</span>
        </div>
      ))}

      <form onSubmit={onSubmit} className="flex items-center">
        <label htmlFor={inputId} className="shrink-0 text-accent">
          {TERMINAL_PROMPT}&nbsp;
        </label>
        <input
          id={inputId}
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          className="w-full flex-1 bg-transparent text-fg caret-accent outline-none"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Terminal input — type a command"
        />
      </form>
    </div>
  )
}

export function Terminal() {
  return (
    <Section id="terminal" className="py-section">
      <SectionHeader
        index="/ 07"
        label="Easter egg"
        title="A shell, for the curious."
        description="Where the personality lives. Type help — then try whoami, stack, or soc."
        className="mb-12"
      />

      <div
        className="scanlines relative overflow-hidden rounded-xl border border-hairline bg-[#0c0b0a] shadow-2xl shadow-black/40"
        data-reveal
      >
        <div className="relative z-[2] flex items-center gap-2 border-b border-hairline px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]/80" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]/80" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]/80" />
          <span className="glitch ml-3 font-mono text-xs text-faint">kryptctl — interactive shell</span>
        </div>
        <TerminalShell />
      </div>
    </Section>
  )
}
