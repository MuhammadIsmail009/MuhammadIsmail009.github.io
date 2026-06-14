import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { useReducedMotion } from '@/lib/useReducedMotion'

/**
 * Hand-built neon line-art: a hooded figure at a laptop. Pure SVG (crisp, tiny).
 * Strokes draw themselves in when scrolled into view; the screen code flickers
 * and the eyes pulse via CSS. Fully static under reduced motion.
 */
export function HackerArt() {
  const root = useRef<SVGSVGElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      if (reduced) return
      const paths = gsap.utils.toArray<SVGElement>('[data-draw]')
      gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 })
      gsap.to(paths, {
        strokeDashoffset: 0,
        duration: 1.3,
        ease: 'power2.out',
        stagger: 0.05,
        scrollTrigger: { trigger: root.current, start: 'top 80%', once: true },
      })
    },
    { scope: root, dependencies: [reduced] },
  )

  return (
    <svg
      ref={root}
      viewBox="0 0 420 400"
      fill="none"
      role="img"
      aria-label="Line-art illustration of a hooded figure working at a laptop"
      className="h-auto w-full max-w-[24rem]"
    >
      <defs>
        <radialGradient id="hk-screenglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgb(var(--data))" stopOpacity="0.3" />
          <stop offset="70%" stopColor="rgb(var(--data))" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hk-ambient" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="rgb(var(--accent))" stopOpacity="0.12" />
          <stop offset="75%" stopColor="rgb(var(--accent))" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* glows */}
      <ellipse cx="210" cy="280" rx="140" ry="86" fill="url(#hk-screenglow)" />
      <ellipse cx="210" cy="200" rx="185" ry="155" fill="url(#hk-ambient)" />

      {/* scan ring for depth */}
      <ellipse
        data-draw
        cx="210"
        cy="180"
        rx="155"
        ry="58"
        pathLength={1}
        stroke="rgb(var(--accent) / 0.22)"
        strokeWidth="1.5"
        strokeDasharray="3 8"
      />

      {/* floating data node cluster (echoes the hero graph) */}
      <g className="hk-float" stroke="rgb(var(--accent) / 0.7)" strokeWidth="1.6" strokeLinecap="round">
        <line data-draw x1="338" y1="66" x2="374" y2="48" pathLength={1} />
        <line data-draw x1="374" y1="48" x2="360" y2="92" pathLength={1} />
        <line data-draw x1="338" y1="66" x2="360" y2="92" pathLength={1} />
        <circle cx="338" cy="66" r="3.5" fill="rgb(var(--accent))" stroke="none" />
        <circle cx="374" cy="48" r="2.5" fill="rgb(var(--fg) / 0.55)" stroke="none" />
        <circle cx="360" cy="92" r="3" fill="rgb(var(--accent))" stroke="none" />
      </g>

      {/* ---- the figure ---- */}
      <g stroke="rgb(var(--accent))" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        {/* hood + shoulders (symmetric) */}
        <path data-draw pathLength={1} d="M122 300 C112 238 142 150 210 124 C278 150 308 238 298 300" />
        {/* shoulders behind laptop */}
        <path
          data-draw
          pathLength={1}
          d="M122 300 C155 282 265 282 298 300"
          stroke="rgb(var(--accent) / 0.45)"
        />
        {/* face opening */}
        <ellipse data-draw cx="210" cy="182" rx="40" ry="48" pathLength={1} fill="rgb(var(--bg) / 0.92)" />
      </g>

      {/* eyes */}
      <g className="hk-eye" stroke="rgb(var(--accent-bright))" strokeWidth="3.4" strokeLinecap="round">
        <line x1="188" y1="180" x2="202" y2="177" />
        <line x1="218" y1="177" x2="232" y2="180" />
      </g>

      {/* ---- laptop ---- */}
      <g stroke="rgb(var(--accent))" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path data-draw pathLength={1} d="M140 240 L280 240 L296 318 L124 318 Z" />
        <path data-draw pathLength={1} d="M124 318 L296 318 L322 350 L98 350 Z" />
        <path
          data-draw
          pathLength={1}
          d="M196 332 L224 332 L228 342 L192 342 Z"
          stroke="rgb(var(--accent) / 0.5)"
          strokeWidth="1.8"
        />
        <path data-draw pathLength={1} d="M124 288 C114 308 124 324 154 330" stroke="rgb(var(--accent) / 0.7)" />
        <path data-draw pathLength={1} d="M296 288 C306 308 296 324 266 330" stroke="rgb(var(--accent) / 0.7)" />
      </g>

      {/* screen code lines (cool data hue, flickering) */}
      <g stroke="rgb(var(--data))" strokeWidth="3" strokeLinecap="round" className="hk-code">
        <line x1="152" y1="258" x2="190" y2="258" style={{ animationDelay: '0s' }} />
        <line x1="196" y1="258" x2="214" y2="258" stroke="rgb(var(--accent-bright))" style={{ animationDelay: '0.5s' }} />
        <line x1="152" y1="274" x2="178" y2="274" style={{ animationDelay: '1s' }} />
        <line x1="184" y1="274" x2="236" y2="274" style={{ animationDelay: '1.4s' }} />
        <line x1="152" y1="290" x2="206" y2="290" style={{ animationDelay: '0.7s' }} />
        <line x1="152" y1="306" x2="184" y2="306" stroke="rgb(var(--accent-bright))" style={{ animationDelay: '1.2s' }} />
        <line x1="190" y1="306" x2="246" y2="306" style={{ animationDelay: '0.3s' }} />
      </g>
    </svg>
  )
}
