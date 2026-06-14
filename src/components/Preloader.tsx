import { useRef } from 'react'
import { gsap, useGSAP, EASE } from '@/lib/gsap'
import { SITE } from '@/lib/content'

/**
 * Full-screen intro overlay: a 000→100 counter + progress line, then a curtain
 * that lifts to reveal the page. `onReveal` fires as the curtain starts (so the
 * hero entrance overlaps the lift); `onDone` fires once it has fully cleared so
 * the parent can unmount it. Only mounted when motion is enabled.
 */
export function Preloader({ onReveal, onDone }: { onReveal: () => void; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const num = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      const counter = { v: 0 }
      const tl = gsap.timeline()

      tl.to(counter, {
        v: 100,
        duration: 1.5,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (num.current) num.current.textContent = String(Math.round(counter.v)).padStart(3, '0')
        },
      })
        .to('[data-pre-bar]', { scaleX: 1, duration: 1.5, ease: 'power2.inOut' }, 0)
        .to('[data-pre-content]', { yPercent: -40, opacity: 0, duration: 0.6, ease: 'power2.in' })
        .add(onReveal, '>-0.05')
        .to(root.current, { yPercent: -100, duration: 1, ease: EASE.curtain }, '<')
        .add(onDone)
    },
    { scope: root },
  )

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-canvas"
      aria-hidden
    >
      <div data-pre-content className="flex flex-col items-center gap-5">
        <span className="font-mono text-xs uppercase tracking-ultra text-faint">{SITE.name}</span>
        <span ref={num} className="font-display text-7xl font-semibold tabular-nums text-fg sm:text-8xl">
          000
        </span>
        <span className="kicker">{SITE.role}</span>
      </div>
      <div
        data-pre-bar
        className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-accent"
      />
    </div>
  )
}
