import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { SITE } from '@/lib/content'
import { ButtonLink } from '@/components/ui'
import { gsap, useGSAP, EASE } from '@/lib/gsap'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { useMotionReady } from '@/lib/motionReady'
import { supportsWebGL } from '@/lib/webgl'
import { onIdle } from '@/lib/idle'
import { SceneBoundary } from '@/components/SceneBoundary'

const HeroScene = lazy(() => import('@/components/HeroScene'))

// Hand-placed constellation — the static fallback for the R3F security graph
// (shown during preload, under reduced motion, and as the Suspense fallback).
const NODES: [number, number][] = [
  [820, 150], [675, 115], [905, 300], [760, 270], [600, 235],
  [705, 420], [860, 455], [560, 395], [640, 560], [800, 615],
  [920, 555], [520, 300], [480, 480], [700, 700], [880, 720], [600, 640],
]
const EDGES: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [1, 4], [3, 4], [3, 5], [2, 6], [5, 6],
  [4, 7], [5, 7], [7, 11], [4, 11], [7, 12], [7, 8], [8, 9], [6, 9],
  [9, 10], [6, 10], [8, 15], [8, 13], [13, 14], [9, 14], [13, 15], [12, 15], [11, 12],
]
const ACTIVE = new Set([0, 7, 9, 14])

function HeroBackdrop() {
  const mask = 'radial-gradient(62% 62% at 62% 45%, #000 38%, transparent 100%)'
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute right-[-12%] top-1/2 h-[82vmin] w-[82vmin] -translate-y-1/2 rounded-full blur-[40px]"
        style={{ background: 'radial-gradient(circle, var(--accent-glow), transparent 66%)' }}
      />
      <svg
        className="absolute inset-0 h-full w-full opacity-60"
        viewBox="0 0 1000 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      >
        <g stroke="rgb(240 133 58 / 0.16)" strokeWidth={1}>
          {EDGES.map(([a, b], i) => (
            <line key={i} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} />
          ))}
        </g>
        {NODES.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={ACTIVE.has(i) ? 4.5 : 2.5}
            fill={ACTIVE.has(i) ? 'rgb(240 133 58 / 0.95)' : 'rgb(242 240 236 / 0.4)'}
          />
        ))}
      </svg>
    </div>
  )
}

export function Hero() {
  const reduced = useReducedMotion()
  const ready = useMotionReady()
  const root = useRef<HTMLElement>(null)
  const webgl = useMemo(() => supportsWebGL(), [])

  // The 3D scene is a desktop enhancement: on phones/tablets the SVG backdrop is
  // the intended visual, which keeps three.js off mobile entirely (battery, data,
  // and the mobile-Lighthouse budget). It also mounts only once the page is idle
  // so the parse stays off the critical path (lower TBT).
  const [showScene, setShowScene] = useState(false)
  useEffect(() => {
    if (reduced || !ready || !webgl) return
    const desktop =
      window.matchMedia('(min-width: 1024px)').matches &&
      window.matchMedia('(pointer: fine)').matches
    if (!desktop) return

    return onIdle(() => setShowScene(true), 1200)
  }, [reduced, ready, webgl])

  useGSAP(
    () => {
      if (reduced) return
      const q = gsap.utils.selector(root)

      // Prep — hidden behind the preloader curtain.
      gsap.set(q('[data-hero-word]'), { yPercent: 115 })
      gsap.set(q('[data-hero-fade]'), { opacity: 0, y: 22 })
      gsap.set(q('[data-hero-kicker]'), { opacity: 0 })
      gsap.set(q('[data-tag-red], [data-tag-blue]'), { opacity: 0 })

      if (!ready) return

      const tl = gsap.timeline({ defaults: { ease: EASE.expo } })
      tl.to(q('[data-hero-word]'), { yPercent: 0, duration: 1.1, stagger: 0.12 })
        .to(q('[data-hero-kicker]'), { opacity: 1, duration: 0.1 }, 0.2)
        .to(
          q('[data-hero-kicker]'),
          {
            duration: 1.3,
            ease: 'none',
            scrambleText: { text: SITE.kicker, chars: 'upperCase', speed: 0.7, revealDelay: 0.2 },
          },
          0.2,
        )
        // Punchline: decode each half in sequence (red side, then blue side).
        .to(q('[data-tag-red]'), { opacity: 1, duration: 0.1 }, '-=0.55')
        .to(
          q('[data-tag-red]'),
          {
            duration: 0.7,
            ease: 'none',
            scrambleText: { text: SITE.taglineRed, chars: '!<>-_\\/[]{}=+*^?#', speed: 0.9 },
          },
          '<',
        )
        .to(q('[data-tag-blue]'), { opacity: 1, duration: 0.1 }, '-=0.35')
        .to(
          q('[data-tag-blue]'),
          {
            duration: 0.7,
            ease: 'none',
            scrambleText: { text: SITE.taglineBlue, chars: '!<>-_\\/[]{}=+*^?#', speed: 0.9 },
          },
          '<',
        )
        .to(q('[data-hero-fade]'), { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }, '-=0.5')
    },
    { scope: root, dependencies: [ready, reduced] },
  )

  return (
    <section
      ref={root}
      id="hero"
      className="relative flex min-h-[100svh] items-center overflow-hidden px-gutter pb-24 pt-32"
    >
      {/* SVG fallback until the 3D scene mounts; kept under reduced motion, when
          WebGL is unavailable, or if the scene errors at runtime. */}
      <div data-hero-scene className="absolute inset-0">
        {showScene ? (
          <SceneBoundary fallback={<HeroBackdrop />}>
            <Suspense fallback={<HeroBackdrop />}>
              <HeroScene />
            </Suspense>
          </SceneBoundary>
        ) : (
          <HeroBackdrop />
        )}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-content">
        <p className="kicker mb-7 flex items-center gap-3">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
          <span data-hero-kicker>{SITE.kicker}</span>
        </p>

        <h1 className="font-display text-display-xl font-semibold text-fg">
          <span className="block overflow-hidden">
            <span data-hero-word className="block">
              Muhammad
            </span>
          </span>
          <span className="block overflow-hidden">
            <span data-hero-word className="glitch-soft block text-accent text-glow">
              Ismail
            </span>
          </span>
        </h1>

        <p className="mt-8 max-w-prose2 font-display text-2xl font-medium leading-[1.12] tracking-tight sm:text-3xl">
          <span data-tag-red className="text-accent text-glow">
            {SITE.taglineRed}
          </span>{' '}
          <span data-tag-blue className="text-data" style={{ textShadow: '0 0 22px rgb(90 200 190 / 0.4)' }}>
            {SITE.taglineBlue}
          </span>
        </p>

        <div className="mt-11 flex flex-wrap items-center gap-4" data-hero-fade>
          <ButtonLink href="#work" variant="primary">
            View Work
          </ButtonLink>
          <ButtonLink href="#contact" variant="ghost">
            Get in touch
          </ButtonLink>
          <ButtonLink
            href="/Muhammad-Ismail-Resume.pdf"
            variant="ghost"
            download="Muhammad-Ismail-Resume.pdf"
            icon="↓"
          >
            Download CV
          </ButtonLink>
        </div>
      </div>

      {/* scroll cue */}
      <div className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 items-center gap-3 sm:flex">
        <span className="kicker">scroll</span>
        <span className="relative block h-10 w-px overflow-hidden bg-accent/15">
          <span
            data-cue
            className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-accent to-transparent"
          />
        </span>
      </div>
    </section>
  )
}
