import { useCallback, useEffect, useRef, useState } from 'react'

/** Fired by the palette / terminal to open the passive-intel dossier. */
export const DOSSIER_EVENT = 'dossier:open'

interface Row {
  k: string
  v: string
  flag?: boolean
}

/* ── all signals are read locally; nothing is transmitted ─────────── */

function webglInfo() {
  try {
    const c = document.createElement('canvas')
    const gl = (c.getContext('webgl') ||
      c.getContext('experimental-webgl')) as WebGLRenderingContext | null
    if (!gl) return { renderer: 'blocked / unavailable', vendor: '—' }
    const dbg = gl.getExtension('WEBGL_debug_renderer_info')
    return {
      renderer: String(dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)),
      vendor: String(dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR)),
    }
  } catch {
    return { renderer: 'blocked', vendor: '—' }
  }
}

function canvasHash() {
  try {
    const c = document.createElement('canvas')
    c.width = 220
    c.height = 48
    const x = c.getContext('2d')
    if (!x) return 'unavailable'
    x.textBaseline = 'top'
    x.font = "15px 'Arial'"
    x.fillStyle = '#f0853a'
    x.fillRect(2, 2, 100, 20)
    x.fillStyle = '#5ac8be'
    x.fillText('ismail·soc·安全·🛰', 4, 6)
    return c.toDataURL()
  } catch {
    return 'unavailable'
  }
}

function detectFonts(): string[] {
  const base = ['monospace', 'sans-serif', 'serif']
  const probe = ['Arial', 'Courier New', 'Georgia', 'Segoe UI', 'Roboto', 'Helvetica',
    'Consolas', 'Tahoma', 'Comic Sans MS', 'Times New Roman', 'Ubuntu', 'Menlo']
  const span = document.createElement('span')
  span.style.cssText = 'position:absolute;left:-9999px;font-size:72px;white-space:nowrap'
  span.textContent = 'mmmmmmmmmmlli WwXx 0123'
  document.body.appendChild(span)
  const sizes: Record<string, [number, number]> = {}
  base.forEach((b) => {
    span.style.fontFamily = b
    sizes[b] = [span.offsetWidth, span.offsetHeight]
  })
  const found = probe.filter((f) =>
    base.some((b) => {
      span.style.fontFamily = `'${f}',${b}`
      return span.offsetWidth !== sizes[b][0] || span.offsetHeight !== sizes[b][1]
    }),
  )
  document.body.removeChild(span)
  return found
}

async function sha256Hex(str: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function platformGuess() {
  const u = navigator.userAgent
  if (/Windows NT 10/.test(u)) return 'Windows 10/11'
  if (/Mac OS X/.test(u)) return 'macOS'
  if (/Android/.test(u)) return 'Android'
  if (/iPhone|iPad/.test(u)) return 'iOS'
  if (/Linux/.test(u)) return 'Linux'
  return 'unknown'
}
function engineGuess() {
  const u = navigator.userAgent
  if (/Edg\//.test(u)) return 'Edge (Chromium)'
  if (/Chrome\//.test(u)) return 'Chrome (Blink)'
  if (/Firefox\//.test(u)) return 'Firefox (Gecko)'
  if (/Safari\//.test(u)) return 'Safari (WebKit)'
  return 'unknown'
}

interface Intel {
  rows: Row[]
  hash: string
  bits: number
  ms: number
}

async function collect(): Promise<Intel> {
  const t0 = performance.now()
  const n = navigator
  const s = screen
  const gl = webglInfo()
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown'
  const fonts = detectFonts()
  const cvs = canvasHash()
  const conn = (n as unknown as { connection?: { effectiveType?: string; downlink?: number; rtt?: number } }).connection

  const rows: Row[] = [
    { k: 'session id', v: 'recognisable without a single cookie', flag: true },
    { k: 'os', v: platformGuess() },
    { k: 'engine', v: engineGuess() },
    { k: 'languages', v: (n.languages || [n.language]).join(', ') },
    { k: 'timezone', v: tz },
    { k: 'screen', v: `${s.width}×${s.height} · ${window.devicePixelRatio || 1}×dpr · ${s.colorDepth}-bit` },
    { k: 'viewport', v: `${window.innerWidth}×${window.innerHeight}` },
    { k: 'gpu', v: gl.renderer },
    { k: 'gpu vendor', v: gl.vendor },
    { k: 'cpu threads', v: String(n.hardwareConcurrency || 'hidden') },
    {
      k: 'memory',
      v: (n as unknown as { deviceMemory?: number }).deviceMemory
        ? `${(n as unknown as { deviceMemory?: number }).deviceMemory} GB`
        : 'hidden',
    },
    { k: 'touch', v: String(n.maxTouchPoints || 0) },
    {
      k: 'network',
      v: conn?.effectiveType ? `${conn.effectiveType} · ~${conn.downlink ?? '?'} Mbps · ${conn.rtt ?? '?'} ms rtt` : 'hidden',
    },
    { k: 'fonts', v: fonts.length ? `${fonts.length} detected · ${fonts.slice(0, 5).join(', ')}…` : 'none exposed' },
    { k: 'canvas', v: 'hashed — unique per GPU + driver' },
    { k: 'cookies', v: n.cookieEnabled ? 'enabled' : 'disabled' },
  ]

  const source = [
    n.userAgent, tz, `${s.width}x${s.height}x${s.colorDepth}`, window.devicePixelRatio,
    gl.renderer, gl.vendor, n.hardwareConcurrency, (n.languages || []).join(','), fonts.join(','), cvs,
  ].join('|')
  const hash = await sha256Hex(source)

  let bits = 10
  if (!/blocked|unavailable/i.test(gl.renderer)) bits += 8
  if (cvs !== 'unavailable') bits += 6
  if (fonts.length > 3) bits += Math.min(6, fonts.length - 3)
  if (tz !== 'unknown') bits += 3
  if (n.hardwareConcurrency) bits += 2

  return { rows, hash, bits, ms: Math.max(1, Math.round(performance.now() - t0)) }
}

/**
 * PASSIVE DNA — a live client-side dossier of what any page can read off the
 * visitor's browser in milliseconds, framed the way an analyst would file it.
 * Strictly local: no storage, no network, and the safebar says so.
 */
export function Dossier() {
  const [open, setOpen] = useState(false)
  const [intel, setIntel] = useState<Intel | null>(null)
  const [copied, setCopied] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener(DOSSIER_EVENT, onOpen)
    return () => window.removeEventListener(DOSSIER_EVENT, onOpen)
  }, [])

  useEffect(() => {
    if (!open) return
    setIntel(null)
    setCopied(false)
    collect().then(setIntel)
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  if (!open) return null

  const pct = intel ? Math.min(100, Math.round((intel.bits / 35) * 100)) : 0
  const verdict = !intel
    ? ''
    : pct >= 75
      ? `≈ ${intel.bits} bits of entropy — this browser is highly unique. Trackers can single you out.`
      : pct >= 50
        ? `≈ ${intel.bits} bits of entropy — fairly identifiable across sites.`
        : `≈ ${intel.bits} bits — low surface. Good privacy hygiene.`

  return (
    <div
      className="fixed inset-0 z-[260] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Passive DNA — browser intel dossier"
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="scanlines relative max-h-[86vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-hairline bg-[#0c0b0a] shadow-2xl shadow-black/60"
      >
        <header className="sticky top-0 z-[2] flex items-start justify-between gap-4 border-b border-hairline bg-[#0c0b0a]/95 px-6 py-5">
          <div>
            <p className="font-mono text-xs text-accent">// PASSIVE DNA</p>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-fg">
              What my sensors read off your browser
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close dossier"
            className="rounded border border-hairline px-2.5 py-1 font-mono text-xs text-muted transition-colors hover:border-accent/60 hover:text-accent"
          >
            ✕
          </button>
        </header>

        <div className="flex items-center gap-2 border-b border-hairline px-6 py-2.5 font-mono text-[0.68rem] text-faint">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
          <b className="text-fg">0 bytes</b> transmitted · gathered client-side
          {intel ? (
            <>
              {' '}
              in <b className="text-fg">{intel.ms}ms</b>
            </>
          ) : null}{' '}
          · nothing left this page
        </div>

        <div className="grid gap-px bg-hairline sm:grid-cols-2">
          {(intel?.rows ?? []).map((r, i) => (
            <div
              key={r.k}
              className={`dossier-row bg-[#0c0b0a] px-6 py-3 ${r.flag ? 'border-l-2 border-accent' : ''}`}
              style={{ animationDelay: `${60 + i * 45}ms` }}
            >
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-faint">{r.k}</p>
              <p className="mt-0.5 break-words font-mono text-xs leading-relaxed text-muted">{r.v}</p>
            </div>
          ))}
          {!intel ? (
            <div className="bg-[#0c0b0a] px-6 py-8 font-mono text-sm text-faint sm:col-span-2">
              assembling dossier…
            </div>
          ) : null}
        </div>

        {intel ? (
          <div className="border-t border-hairline px-6 py-5">
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-faint">
                device fingerprint
              </span>
              <span className="truncate font-mono text-xs text-accent">
                {intel.hash.slice(0, 32).replace(/(.{4})/g, '$1 ').trim()}
              </span>
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded bg-surface">
              <div
                className="h-full rounded bg-gradient-to-r from-accent-deep via-accent to-accent-bright transition-[width] duration-1000 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2 font-mono text-xs text-muted">{verdict}</p>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-4">
              <p className="max-w-md text-pretty text-xs leading-relaxed text-faint">
                Every site you open reads this in milliseconds — no permission prompt, no click.
                In the SOC this is column one of triage: know what you emit.
              </p>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard?.writeText(intel.hash).then(() => {
                    setCopied(true)
                    window.setTimeout(() => setCopied(false), 1400)
                  }).catch(() => {})
                }}
                className="rounded-full border border-hairline px-4 py-1.5 font-mono text-xs text-muted transition-colors hover:border-accent/60 hover:text-accent"
              >
                {copied ? 'copied ✓' : 'Copy my fingerprint'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
