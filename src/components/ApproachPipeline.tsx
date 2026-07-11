import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/lib/useReducedMotion'

/**
 * Live detection pipeline — a hostile event (red diamond) rides the wire
 * through the four gates; each gate it clears pulses, lights its step card,
 * and shifts the event's colour toward ember until the case is closed. Canvas
 * runs only while on screen; not mounted at all under reduced motion.
 */
const THREAT: [number, number, number] = [226, 91, 74]
const EMBER: [number, number, number] = [240, 133, 58]
const TRAVEL = 1.1 // seconds between gates
const DWELL = 0.6 // seconds inspecting at a gate

export function ApproachPipeline() {
  const reduced = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const steps = Array.from(
      canvas.closest('section')?.querySelectorAll<HTMLElement>('[data-approach-step]') ?? [],
    )
    const N = steps.length || 4

    let w = 1
    let h = 1
    let dpr = 1
    let gates: { x: number; hit: number }[] = []
    let raf = 0
    let started = false
    let flow = 0
    // travelling event state
    const P = { x: 0, level: 0 }
    let mode: 'travel' | 'dwell' = 'travel'
    let seg = 0
    let from = 0
    let to = 0
    let segStart = 0
    let activeIdx = -1

    const layout = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const r = canvas.getBoundingClientRect()
      if (r.width < 2) return
      w = canvas.width = Math.round(r.width * dpr)
      h = canvas.height = Math.round(r.height * dpr)
      gates = Array.from({ length: N }, (_, i) => ({ x: ((i + 0.5) / N) * w, hit: 0 }))
    }

    const setActive = (i: number) => {
      if (i === activeIdx) return
      clearActive()
      activeIdx = i
      steps[i]?.classList.add('is-active')
    }
    const clearActive = () => {
      if (activeIdx >= 0) steps[activeIdx]?.classList.remove('is-active')
      activeIdx = -1
    }

    const startCycle = (now: number) => {
      seg = 0
      mode = 'travel'
      segStart = now
      P.level = 0
      from = -0.08 * w
      to = gates[0]?.x ?? w
      P.x = from
    }

    const update = (now: number) => {
      flow += 0.02
      if (!gates.length) {
        layout()
        return
      }
      for (const g of gates) g.hit *= 0.92
      if (mode === 'travel') {
        const u = Math.min(1, (now - segStart) / TRAVEL)
        const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2
        P.x = from + (to - from) * e
        if (u >= 1) {
          if (seg < N) {
            mode = 'dwell'
            segStart = now
            gates[seg].hit = 1
            P.level = seg + 1
            setActive(seg)
          } else startCycle(now)
        }
      } else if (now - segStart >= DWELL) {
        seg++
        mode = 'travel'
        segStart = now
        from = P.x
        to = seg < N ? gates[seg].x : 1.08 * w
        if (seg >= N) clearActive()
      }
    }

    const mix = (t: number) => {
      const c = THREAT.map((v, i) => Math.round(v + (EMBER[i] - v) * t))
      return `rgb(${c[0]},${c[1]},${c[2]})`
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      const y = h * 0.5
      const gh = h * 0.3

      // the wire, plus the swept (inspected) segment as flowing dashes
      ctx.strokeStyle = 'rgba(242,240,236,0.10)'
      ctx.lineWidth = 1.5 * dpr
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
      ctx.strokeStyle = 'rgba(240,133,58,0.32)'
      ctx.setLineDash([6 * dpr, 14 * dpr])
      ctx.lineDashOffset = -flow * 30 * dpr
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(Math.max(0, P.x), y)
      ctx.stroke()
      ctx.setLineDash([])

      gates.forEach((g, i) => {
        const lit = i < P.level || g.hit > 0.05
        const bw = 10 * dpr
        ctx.strokeStyle = lit ? 'rgba(240,133,58,0.85)' : 'rgba(242,240,236,0.22)'
        ctx.lineWidth = 2 * dpr
        ctx.beginPath()
        ctx.moveTo(g.x - bw, y - gh)
        ctx.lineTo(g.x, y - gh)
        ctx.lineTo(g.x, y + gh)
        ctx.lineTo(g.x - bw, y + gh)
        ctx.moveTo(g.x + bw, y - gh)
        ctx.lineTo(g.x, y - gh)
        ctx.moveTo(g.x + bw, y + gh)
        ctx.lineTo(g.x, y + gh)
        ctx.stroke()
        if (g.hit > 0.05) {
          ctx.strokeStyle = `rgba(240,133,58,${(g.hit * 0.7).toFixed(3)})`
          ctx.lineWidth = 1.5 * dpr
          ctx.beginPath()
          ctx.arc(g.x, y, (14 + (1 - g.hit) * 26) * dpr, 0, Math.PI * 2)
          ctx.stroke()
        }
        ctx.fillStyle = lit ? 'rgba(240,133,58,0.9)' : 'rgba(242,240,236,0.3)'
        ctx.font = `${9 * dpr}px 'JetBrains Mono', monospace`
        ctx.textAlign = 'center'
        ctx.fillText(String(i + 1).padStart(2, '0'), g.x, y - gh - 8 * dpr)
      })

      // the event: soft halo, containment rings per cleared gate, spinning diamond
      ctx.fillStyle = 'rgba(240,133,58,0.10)'
      ctx.beginPath()
      ctx.arc(P.x, y, 22 * dpr, 0, Math.PI * 2)
      ctx.fill()
      for (let k = 0; k < P.level; k++) {
        ctx.strokeStyle = `rgba(240,133,58,${(0.5 - k * 0.09).toFixed(3)})`
        ctx.lineWidth = 1.5 * dpr
        ctx.beginPath()
        ctx.arc(P.x, y, (12 + k * 7) * dpr, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.save()
      ctx.translate(P.x, y)
      ctx.rotate(flow * 0.5)
      const s = 7 * dpr
      ctx.fillStyle = mix(P.level / N)
      ctx.beginPath()
      ctx.moveTo(0, -s)
      ctx.lineTo(s, 0)
      ctx.lineTo(0, s)
      ctx.lineTo(-s, 0)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }

    const frame = (ts: number) => {
      if (!started) return
      update(ts / 1000)
      draw()
      raf = requestAnimationFrame(frame)
    }

    layout()
    let resizeT: number | undefined
    const onResize = () => {
      window.clearTimeout(resizeT)
      resizeT = window.setTimeout(layout, 200)
    }
    window.addEventListener('resize', onResize)

    const io = new IntersectionObserver(
      ([en]) => {
        if (en.isIntersecting && !started) {
          started = true
          layout()
          startCycle(performance.now() / 1000)
          raf = requestAnimationFrame(frame)
        } else if (!en.isIntersecting && started) {
          started = false
          cancelAnimationFrame(raf)
          clearActive()
        }
      },
      { threshold: 0.2 },
    )
    io.observe(canvas)

    return () => {
      started = false
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('resize', onResize)
      window.clearTimeout(resizeT)
      clearActive()
    }
  }, [reduced])

  if (reduced) return null
  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="mb-4 h-24 w-full sm:h-28"
      data-approach-canvas
    />
  )
}
