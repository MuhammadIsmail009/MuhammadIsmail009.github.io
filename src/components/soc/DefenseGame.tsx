import { useEffect, useRef, useState } from 'react'
import { SOC } from '@/lib/content'

interface Hostile {
  id: number
  x: number
  y: number
  tx: number
  ty: number
  node: number
  speed: number
  ip: string
}

interface FeedLine {
  id: number
  time: string
  tag: 'OK' | 'SYS' | 'HINT' | 'RECON' | 'BLOCK' | 'BREACH'
  msg: string
}

const SIZE = 400
const C = SIZE / 2
const NODE_R = 132
const SPAWN_R = 215

const nodePos = (i: number) => {
  const a = (i / SOC.defense.nodes.length) * Math.PI * 2 - Math.PI / 2
  return { x: C + Math.cos(a) * NODE_R, y: C + Math.sin(a) * NODE_R }
}

const randIp = () =>
  `${10 + Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 255)}.${Math.floor(
    Math.random() * 255,
  )}.${Math.floor(Math.random() * 255)}`

const now = () =>
  new Date().toLocaleTimeString('en-GB', { hour12: false })

const TAG_COLOR: Record<FeedLine['tag'], string> = {
  OK: 'text-data',
  SYS: 'text-muted',
  HINT: 'text-accent-bright',
  RECON: 'text-accent',
  BLOCK: 'text-data',
  BREACH: 'text-[#ff5f57]',
}

/**
 * "defend.sh" — a toy SOC: hostiles crawl toward network segments, the analyst
 * clicks to block them before they breach. Pure DOM/SVG + one rAF loop.
 */
export function DefenseGame() {
  const [hostiles, setHostiles] = useState<Hostile[]>([])
  const [feed, setFeed] = useState<FeedLine[]>([])
  const [blocked, setBlocked] = useState(0)
  const [breaches, setBreaches] = useState(0)
  const [auto, setAuto] = useState(false)
  const [hitNode, setHitNode] = useState<number | null>(null)
  const idRef = useRef(0)
  const feedIdRef = useRef(0)
  // Source of truth for the rAF loop; state mirrors it for rendering. Keeping
  // the simulation out of setState updaters keeps StrictMode double-invokes
  // (and their duplicated side effects) out of the picture.
  const hostilesRef = useRef<Hostile[]>([])

  const log = (tag: FeedLine['tag'], msg: string) =>
    setFeed((f) => [{ id: feedIdRef.current++, time: now(), tag, msg }, ...f].slice(0, 28))

  // Boot feed.
  useEffect(() => {
    SOC.defense.feedBoot.forEach((l, i) => {
      const tag: FeedLine['tag'] = i === 0 ? 'OK' : i === 1 ? 'SYS' : 'HINT'
      log(tag, l.replace(/^\[ OK \] |^SYS {2}|^HINT /, ''))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const spawn = (n: number) => {
    const fresh: Hostile[] = Array.from({ length: n }, () => {
      const a = Math.random() * Math.PI * 2
      const node = Math.floor(Math.random() * SOC.defense.nodes.length)
      const t = nodePos(node)
      const ip = randIp()
      log('RECON', `${ip} scanning ${SOC.defense.nodes[node]} segment`)
      return {
        id: idRef.current++,
        x: C + Math.cos(a) * SPAWN_R,
        y: C + Math.sin(a) * SPAWN_R,
        tx: t.x,
        ty: t.y,
        node,
        speed: 26 + Math.random() * 22,
        ip,
      }
    })
    hostilesRef.current = [...hostilesRef.current, ...fresh]
    setHostiles(hostilesRef.current)
  }

  // Movement loop — simulate on the ref, then mirror into state for render.
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const tick = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.05)
      last = t
      if (hostilesRef.current.length) {
        const survivors: Hostile[] = []
        for (const h of hostilesRef.current) {
          const dx = h.tx - h.x
          const dy = h.ty - h.y
          const dist = Math.hypot(dx, dy)
          if (dist < 13) {
            setBreaches((b) => b + 1)
            setHitNode(h.node)
            window.setTimeout(() => setHitNode(null), 600)
            log('BREACH', `${h.ip} → ${SOC.defense.nodes[h.node]} segment compromised`)
            continue
          }
          survivors.push({
            ...h,
            x: h.x + (dx / dist) * h.speed * dt,
            y: h.y + (dy / dist) * h.speed * dt,
          })
        }
        hostilesRef.current = survivors
        setHostiles(survivors)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto mode.
  useEffect(() => {
    if (!auto) return
    const id = window.setInterval(() => spawn(1 + Math.floor(Math.random() * 2)), 1400)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto])

  const block = (h: Hostile) => {
    if (!hostilesRef.current.some((x) => x.id === h.id)) return
    hostilesRef.current = hostilesRef.current.filter((x) => x.id !== h.id)
    setHostiles(hostilesRef.current)
    setBlocked((b) => b + 1)
    log('BLOCK', `${h.ip} dropped at the edge — rule pushed`)
  }

  const threat = Math.min(hostiles.length / 8, 1)

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Map */}
      <div className="relative min-h-0 flex-1">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full" role="img" aria-label="Network defense map">
          <circle cx={C} cy={C} r={SPAWN_R - 30} fill="none" stroke="rgb(90 200 190 / 0.25)" strokeDasharray="4 7" />
          {/* spokes */}
          {SOC.defense.nodes.map((_, i) => {
            const p = nodePos(i)
            return <line key={i} x1={C} y1={C} x2={p.x} y2={p.y} stroke="rgb(255 247 236 / 0.08)" />
          })}
          {/* core */}
          <circle cx={C} cy={C} r={30} fill="rgb(240 133 58 / 0.12)" stroke="rgb(240 133 58 / 0.8)" />
          <text x={C} y={C + 1} textAnchor="middle" dominantBaseline="middle" className="fill-accent font-mono" fontSize="9" fontWeight="700">
            {SOC.defense.core}
          </text>
          {/* segment nodes */}
          {SOC.defense.nodes.map((n, i) => {
            const p = nodePos(i)
            const hit = hitNode === i
            return (
              <g key={n}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={15}
                  fill={hit ? 'rgb(255 95 87 / 0.35)' : 'rgb(23 20 16 / 0.9)'}
                  stroke={hit ? '#ff5f57' : 'rgb(90 200 190 / 0.7)'}
                />
                <text x={p.x} y={p.y + 27} textAnchor="middle" className="fill-faint font-mono" fontSize="8.5">
                  {n}
                </text>
              </g>
            )
          })}
          {/* hostiles */}
          {hostiles.map((h) => (
            <g key={h.id} onClick={() => block(h)} className="cursor-crosshair">
              {/* generous invisible hit area */}
              <circle cx={h.x} cy={h.y} r={16} fill="transparent" />
              <rect
                x={h.x - 4.5}
                y={h.y - 4.5}
                width={9}
                height={9}
                transform={`rotate(45 ${h.x} ${h.y})`}
                fill="#ff5f57"
                stroke="rgb(255 95 87 / 0.4)"
                strokeWidth={4}
              />
            </g>
          ))}
        </svg>

        {/* HUD */}
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-hairline bg-[#0a0908]/90 px-4 py-3 font-mono text-[0.65rem] uppercase tracking-[0.12em]">
          <span className="flex items-center gap-2 text-faint">
            Threat
            <span className="block h-1 w-20 overflow-hidden rounded-full bg-surface-2">
              <span
                className="block h-full rounded-full bg-gradient-to-r from-accent to-[#ff5f57] transition-all duration-300"
                style={{ width: `${threat * 100}%` }}
              />
            </span>
          </span>
          <span className="text-faint">
            Blocked <span className="text-data">{blocked}</span>
          </span>
          <span className="text-faint">
            Breaches <span className={breaches ? 'text-[#ff5f57]' : 'text-muted'}>{breaches}</span>
          </span>
          <span className="text-faint">
            Hostiles <span className="text-accent">{hostiles.length}</span>
          </span>
          <span className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={() => spawn(4 + Math.floor(Math.random() * 3))}
              className="rounded border border-[#ff5f57]/50 px-2.5 py-1.5 text-[#ff5f57] transition-colors hover:bg-[#ff5f57]/10"
            >
              ◎ Launch wave
            </button>
            <button
              type="button"
              onClick={() => setAuto((a) => !a)}
              className={`rounded border px-2.5 py-1.5 transition-colors ${
                auto
                  ? 'border-accent bg-accent text-canvas'
                  : 'border-hairline text-muted hover:border-accent/50 hover:text-accent'
              }`}
              aria-pressed={auto}
            >
              Auto
            </button>
          </span>
        </div>
      </div>

      {/* Live feed */}
      <aside className="h-40 shrink-0 overflow-y-auto border-t border-hairline px-4 py-3 lg:h-auto lg:w-72 lg:border-l lg:border-t-0">
        <p className="mb-2 flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-faint">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-accent" aria-hidden />
          SOC live feed
        </p>
        <ol className="space-y-1 font-mono text-[0.68rem] leading-relaxed">
          {feed.map((l) => (
            <li key={l.id} className="text-faint">
              <span className="text-faint/70">{l.time}</span>{' '}
              <span className={TAG_COLOR[l.tag]}>{l.tag}</span> <span className="text-muted">{l.msg}</span>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  )
}
