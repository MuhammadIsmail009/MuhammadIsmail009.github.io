import { useEffect, type ReactNode } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { setLenis } from '@/lib/scroll'
import { useReducedMotion } from '@/lib/useReducedMotion'

/**
 * Lenis smooth scroll driven by the GSAP ticker and synced to ScrollTrigger.
 * Disabled entirely under prefers-reduced-motion (native scroll takes over).
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) {
      setLenis(null)
      return
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    })
    setLenis(lenis)

    lenis.on('scroll', ScrollTrigger.update)

    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // ScrollTrigger should measure after Lenis is live.
    ScrollTrigger.refresh()

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      setLenis(null)
    }
  }, [reduced])

  return <>{children}</>
}
