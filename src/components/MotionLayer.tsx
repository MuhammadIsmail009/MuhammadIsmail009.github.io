import { useEffect } from 'react'
import { gsap, useGSAP, ScrollTrigger, EASE } from '@/lib/gsap'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { initMagnetics } from '@/lib/magnetic'

/**
 * Site-wide scroll choreography. Renders nothing; owns the global motion that
 * isn't local to one component:
 *   - [data-reveal]      → fade/rise in on scroll (batched, staggered)
 *   - [data-work-card]   → horizontal-track card stagger
 *   - [data-counter]     → count up from 0 when scrolled into view
 *   - [data-magnetic]    → magnetic hover
 *   - [data-nav]         → condensed state once past the hero
 *
 * Everything is gated on `ready` (preloader done) and fully bypassed under
 * prefers-reduced-motion — the static content is already visible in that path.
 */
export function MotionLayer({ ready }: { ready: boolean }) {
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      if (reduced) return

      // Prep: hide everything we're about to reveal. Done on every run so the
      // hidden state is in place behind the preloader curtain before it lifts.
      gsap.set('[data-reveal]', { opacity: 0, y: 28 })
      gsap.set('[data-work-card]', { opacity: 0, y: 48 })

      if (!ready) return

      ScrollTrigger.batch('[data-reveal]', {
        start: 'top 88%',
        onEnter: (els) =>
          gsap.to(els, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: EASE.expo,
            stagger: 0.09,
            overwrite: true,
          }),
      })

      ScrollTrigger.batch('[data-work-card]', {
        start: 'top 92%',
        onEnter: (els) =>
          gsap.to(els, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: EASE.expo,
            stagger: 0.12,
            overwrite: true,
          }),
      })

      // Count-up counters.
      gsap.utils.toArray<HTMLElement>('[data-counter]').forEach((el) => {
        const value = Number(el.dataset.value ?? '0')
        const pad = el.dataset.pad === '2'
        const obj = { n: 0 }
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter: () =>
            gsap.to(obj, {
              n: value,
              duration: 1.6,
              ease: 'power2.out',
              onUpdate: () => {
                const n = Math.round(obj.n)
                el.textContent = pad ? String(n).padStart(2, '0') : String(n)
              },
            }),
        })
      })

      // Nav condenses once we've left the hero.
      const nav = document.querySelector('[data-nav]')
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => nav?.classList.toggle('is-scrolled', self.scroll() > 80),
      })

      ScrollTrigger.refresh()
    },
    { dependencies: [ready, reduced] },
  )

  // Magnetic hover — plain DOM listeners, so kept outside the gsap context.
  useEffect(() => {
    if (reduced || !ready) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    return initMagnetics(document)
  }, [ready, reduced])

  return null
}
