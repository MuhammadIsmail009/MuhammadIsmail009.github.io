import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'

/**
 * Custom dual cursor — a precise dot plus a lagging ring that grows over
 * interactive targets. Fine-pointer only; never mounted under reduced motion
 * or on touch (the OS cursor stays as the real fallback either way).
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const dotEl = dot.current
    const ringEl = ring.current
    if (!dotEl || !ringEl) return

    gsap.set([dotEl, ringEl], { xPercent: -50, yPercent: -50 })

    const xDot = gsap.quickTo(dotEl, 'x', { duration: 0.15, ease: 'power3' })
    const yDot = gsap.quickTo(dotEl, 'y', { duration: 0.15, ease: 'power3' })
    const xRing = gsap.quickTo(ringEl, 'x', { duration: 0.5, ease: 'power3' })
    const yRing = gsap.quickTo(ringEl, 'y', { duration: 0.5, ease: 'power3' })

    let visible = false
    // The closest() walk only reruns when the hovered element changes, not on
    // every mousemove.
    let lastTarget: EventTarget | null = null
    const onMove = (e: MouseEvent) => {
      if (!visible) {
        visible = true
        gsap.to([dotEl, ringEl], { autoAlpha: 1, duration: 0.3 })
      }
      xDot(e.clientX)
      yDot(e.clientY)
      xRing(e.clientX)
      yRing(e.clientY)

      if (e.target === lastTarget) return
      lastTarget = e.target
      const target = e.target as HTMLElement
      const interactive = target?.closest('a, button, [data-magnetic], input, [role="button"]')

      gsap.to(ringEl, {
        scale: interactive ? 1.8 : 1,
        borderColor: interactive ? 'rgb(142 158 196 / 0.9)' : 'rgb(142 158 196 / 0.35)',
        duration: 0.3,
        overwrite: 'auto',
      })
    }

    const onLeave = () => {
      visible = false
      lastTarget = null
      gsap.to([dotEl, ringEl], { autoAlpha: 0, duration: 0.3 })
    }

    window.addEventListener('mousemove', onMove)
    document.documentElement.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  })

  return (
    <div className="pointer-events-none fixed inset-0 z-[250] hidden [@media(pointer:fine)]:block">
      <div
        ref={ring}
        className="invisible fixed left-0 top-0 h-9 w-9 rounded-full border border-accent/35"
      />
      <div ref={dot} className="invisible fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-accent" />
    </div>
  )
}
