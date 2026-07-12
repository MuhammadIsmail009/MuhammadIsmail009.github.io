import { useRef, useState } from 'react'
import { CONTACT, CTA, SITE, STATUS } from '@/lib/content'
import { scrollTo } from '@/lib/scroll'
import { useGSAP, ScrollTrigger, gsap, EASE } from '@/lib/gsap'
import { useReducedMotion } from '@/lib/useReducedMotion'

// The handover note — printed line by line from the slot when the footer
// enters view. Deliberately a printer feed, not typing or decrypting.
const HANDOVER_LINES = [
  '──── END OF SHIFT · HANDOVER NOTE ────',
  'analyst        : m.ismail',
  'shift summary  : detections shipped · queue clear · nothing got past',
  'open item      : one unread message to ismail',
  'handing off to : [ you ]',
]

export function Footer() {
  const year = new Date().getFullYear()
  const reduced = useReducedMotion()
  const feed = useRef<HTMLDivElement>(null)
  const [acked, setAcked] = useState(false)
  const [ackLine, setAckLine] = useState('')

  // Print the note once the contact section is reached.
  useGSAP(
    () => {
      if (reduced || !feed.current) return
      const lines = feed.current.querySelectorAll('[data-feed-line]')
      gsap.set(lines, { yPercent: 120 })
      ScrollTrigger.create({
        trigger: '#contact',
        start: 'top 62%',
        once: true,
        onEnter: () => {
          gsap.to(lines, {
            yPercent: 0,
            duration: 0.7,
            ease: EASE.expo,
            stagger: 0.14,
          })
        },
      })
    },
    { dependencies: [reduced] },
  )

  const acknowledge = () => {
    if (acked) return
    setAcked(true)
    const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setAckLine(`handover acknowledged · ${t} local · email copied`)
    void navigator.clipboard?.writeText(CONTACT.email).catch(() => {})
  }

  return (
    <footer id="contact" className="relative overflow-hidden px-gutter pb-10 pt-section">
      {/* ember floor glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-1/3 left-1/2 h-[64vmin] w-[94vmin] -translate-x-1/2 rounded-full blur-[52px]"
        style={{ background: 'radial-gradient(circle, var(--accent-glow), transparent 72%)' }}
      />

      <div className="relative mx-auto max-w-content">
        {STATUS.available ? (
          <div className="mb-10 inline-flex items-center gap-2.5 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-60 ${
                  acked ? 'bg-data' : 'animate-ping bg-accent'
                }`}
              />
              <span
                className={`relative inline-flex h-2 w-2 rounded-full transition-colors duration-500 ${
                  acked ? 'bg-data' : 'bg-accent'
                }`}
              />
            </span>
            <span
              className={`font-mono text-xs transition-colors duration-500 ${
                acked ? 'text-data' : 'text-accent'
              }`}
            >
              {acked ? 'Handed off — the watch is yours' : STATUS.label}
            </span>
          </div>
        ) : null}

        <h2
          className="max-w-[18ch] font-display text-display-lg font-semibold leading-[0.98] tracking-tight text-fg"
          data-split
        >
          {CTA.headline}
        </h2>
        <p className="mt-6 max-w-prose2 text-pretty text-lg text-muted" data-reveal>
          {CTA.sub}
        </p>

        {/* the handover — every shift ends with one; this site does too */}
        <div className="mt-12 max-w-xl" data-reveal>
          {/* printer slot */}
          <div className="mb-[-1px] flex items-center gap-3" aria-hidden>
            <span className="h-[3px] w-24 rounded-full bg-surface-2" />
            <span className="font-mono text-[0.6rem] tracking-[0.2em] text-faint">FEED</span>
          </div>
          <div
            ref={feed}
            className="rounded-lg border border-hairline bg-surface/30 px-5 py-4 font-mono text-xs leading-loose text-muted"
          >
            {HANDOVER_LINES.map((line) => (
              <div key={line} className="overflow-hidden">
                <div data-feed-line className="whitespace-pre-wrap">
                  {line}
                </div>
              </div>
            ))}
            {ackLine ? (
              <div className="overflow-hidden" aria-live="polite">
                <div className="feed-ack whitespace-pre-wrap text-data">{ackLine}</div>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={acknowledge}
            disabled={acked}
            className={`mt-5 inline-flex items-center gap-3 rounded-full border px-6 py-3 font-mono text-sm transition-colors duration-300 ${
              acked
                ? 'cursor-default border-data/50 text-data'
                : 'border-accent/50 bg-accent/10 text-accent hover:border-accent hover:bg-accent/15'
            }`}
            data-magnetic
          >
            {acked ? '✓ handover acknowledged' : 'acknowledge handover'}
          </button>
        </div>

        <div className="mt-10" data-reveal>
          <a
            href={`mailto:${CONTACT.email}`}
            className="group inline-flex items-center gap-3 font-display text-2xl font-medium text-fg transition-colors hover:text-accent sm:text-4xl"
            data-magnetic
          >
            <span>{CONTACT.email}</span>
            <span className="transition-transform duration-300 group-hover:translate-x-2" aria-hidden>
              →
            </span>
          </a>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-hairline pt-8">
          <nav className="flex flex-wrap gap-6 font-mono text-sm" aria-label="Social">
            <a
              href={CONTACT.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted transition-colors hover:text-accent"
            >
              LinkedIn ↗
            </a>
            <a
              href={CONTACT.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted transition-colors hover:text-accent"
            >
              GitHub ↗
            </a>
            <a
              href={`mailto:${CONTACT.email}`}
              className="text-muted transition-colors hover:text-accent"
            >
              Email ↗
            </a>
          </nav>
          <button
            type="button"
            onClick={() => scrollTo('#hero', { offset: 0 })}
            className="font-mono text-xs text-faint transition-colors hover:text-accent"
          >
            Back to top ↑
          </button>
        </div>

        <p className="mt-8 font-mono text-xs text-faint">
          © {year} {SITE.name}. Built with React, GSAP &amp; three.js.
        </p>
      </div>
    </footer>
  )
}
