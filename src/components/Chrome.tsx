import { useEffect, useRef, useState } from 'react'
import { SECTION_INDEX } from '@/lib/content'
import { scrollTo } from '@/lib/scroll'

/**
 * Site-wide "alive" chrome: a top scroll-progress bar and a fixed left rail of
 * section index dots (desktop only). Both run on native scroll position, which
 * Lenis drives too, so no GSAP dependency here.
 */
export function Chrome() {
  const barRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState('hero')

  // Progress bar — rAF-throttled scroll listener writing a transform.
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const doc = document.documentElement
        const max = doc.scrollHeight - window.innerHeight
        const p = max > 0 ? window.scrollY / max : 0
        if (barRef.current) barRef.current.style.transform = `scaleX(${p})`
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // Active section — a narrow band around the viewport centre.
  useEffect(() => {
    const sections = SECTION_INDEX.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    )
    if (!sections.length) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    sections.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <>
      {/* Scroll progress */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[120] h-0.5">
        <div
          ref={barRef}
          className="h-full origin-left bg-gradient-to-r from-accent-deep via-accent to-accent-bright"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      {/* Section index rail */}
      <nav
        aria-label="Section index"
        className="fixed left-5 top-1/2 z-[90] hidden -translate-y-1/2 flex-col gap-3.5 xl:flex"
      >
        {SECTION_INDEX.map((s) => {
          const on = active === s.id
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollTo(`#${s.id}`, s.id === 'hero' ? { offset: 0 } : undefined)}
              className="group flex items-center gap-3"
              aria-label={`Go to ${s.label}`}
              aria-current={on ? 'true' : undefined}
            >
              <span
                className={`block h-1.5 w-1.5 rounded-full ring-1 transition-all duration-300 ${
                  on
                    ? 'scale-125 bg-accent ring-accent/60 shadow-[0_0_10px_rgba(142,158,196,0.7)]'
                    : 'bg-transparent ring-faint/50 group-hover:ring-accent/70'
                }`}
              />
              <span
                className={`font-mono text-[0.6rem] uppercase tracking-[0.18em] transition-opacity duration-300 ${
                  on ? 'text-accent opacity-100' : 'text-faint opacity-0 group-hover:opacity-100'
                }`}
              >
                {s.label}
              </span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
