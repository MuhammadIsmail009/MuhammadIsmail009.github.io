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
      let tl: gsap.core.Timeline | undefined
      let cancelled = false

      const build = () => {
        if (cancelled || !root.current) return
        const counter = { v: 0 }
        tl = gsap.timeline()
        tl.to(counter, {
          v: 100,
          duration: 0.8,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (num.current) num.current.textContent = String(Math.round(counter.v)).padStart(3, '0')
          },
        })
          .to('[data-pre-bar]', { scaleX: 1, duration: 0.8, ease: 'power2.inOut' }, 0)
          .to('[data-pre-content]', { yPercent: -40, opacity: 0, duration: 0.35, ease: 'power2.in' })
          .add(onReveal, '>-0.05')
          .to(root.current, { yPercent: -100, duration: 0.55, ease: EASE.curtain }, '<')
          .add(onDone)
      }

      // Hold the curtain until webfonts are ready (capped) so the hero's
      // font-swap reflow happens behind the preloader — no visible CLS.
      const fonts = document.fonts?.ready ?? Promise.resolve()
      Promise.race([fonts, new Promise((r) => setTimeout(r, 1500))]).then(build)

      return () => {
        cancelled = true
        tl?.kill()
      }
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
