import { useEffect } from 'react'
import { gsap, useGSAP, ScrollTrigger, SplitText, EASE } from '@/lib/gsap'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { initMagnetics } from '@/lib/magnetic'
import { onIdle } from '@/lib/idle'
import { NAV } from '@/lib/content'

/**
 * Condense the nav past the hero + scrollspy the active section link. Called
 * inside the gsap context so the ScrollTriggers it creates are auto-reverted.
 */
function buildNavState() {
  const nav = document.querySelector('[data-nav]')
  if (!nav) return

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => nav.classList.toggle('is-scrolled', self.scroll() > 80),
  })

  const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'))
  const setActive = (href: string) => {
    links.forEach((a) => {
      const on = a.getAttribute('href') === href
      a.classList.toggle('is-active', on)
      if (on) a.setAttribute('aria-current', 'true')
      else a.removeAttribute('aria-current')
    })
  }

  NAV.forEach(({ href }) => {
    const section = document.querySelector(href)
    if (!section) return
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onToggle: (self) => self.isActive && setActive(href),
    })
  })
}

/**
 * Site-wide scroll choreography. Renders nothing; owns the global motion that
 * isn't local to one component:
 *   - [data-reveal]      → fade/rise in on scroll (batched, staggered)
 *   - [data-counter]     → count up from 0 when scrolled into view
 *   - [data-magnetic]    → magnetic hover
 *   - [data-nav]         → condensed state past the hero + active-link scrollspy
 *
 * Everything is gated on `ready` (preloader done) and fully bypassed under
 * prefers-reduced-motion — the static content is already visible in that path.
 */
export function MotionLayer({ ready }: { ready: boolean }) {
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      // Nav state (condense + scrollspy) works on native scroll too, so it runs
      // even under reduced motion. Hero entrance / reveals are motion-only.
      if (reduced) {
        buildNavState()
        return
      }

      // Prep: hide everything we're about to reveal. Done on every run so the
      // hidden state is in place behind the preloader curtain before it lifts.
      // Headings ([data-split]) are handled by the line reveal below.
      gsap.set('[data-reveal]:not([data-split])', { opacity: 0, y: 36 })
      gsap.set('[data-split]', { opacity: 0 })

      if (!ready) return

      buildNavState()

      // The single accent hue, read from the token so it follows the palette.
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()

      ScrollTrigger.batch('[data-reveal]:not([data-split])', {
        start: 'top 88%',
        onEnter: (els) =>
          gsap.to(els, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: EASE.expo,
            stagger: 0.1,
            overwrite: true,
          }),
      })

      // Heading reveals — split into lines and slide each up from behind a mask.
      // Deferred to idle so the line-splitting DOM work stays off the initial
      // critical path (lower TBT); autoSplit re-splits once fonts/width settle.
      let splits: SplitText[] = []
      const cancelSplit = onIdle(() => {
        splits = gsap.utils.toArray<HTMLElement>('[data-split]').map((el) =>
          SplitText.create(el, {
            type: 'lines',
            mask: 'lines',
            autoSplit: true,
            linesClass: 'split-line',
            onSplit(self) {
              gsap.set(el, { opacity: 1 })
              // Each heading rises from behind its mask AND flashes slate → white,
              // so scrolling a section into view "highlights" it in the one accent.
              return gsap.from(self.lines, {
                yPercent: 115,
                color: `rgb(${accent})`,
                clearProps: 'color',
                duration: 1.1,
                ease: EASE.expo,
                stagger: 0.12,
                scrollTrigger: { trigger: el, start: 'top 86%', once: true },
              })
            },
          }),
        )
      }, 1500)

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

      // Revert SplitText DOM wrapping on cleanup (re-runs are deps-driven only).
      return () => {
        cancelSplit()
        splits.forEach((s) => s.revert())
      }
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
