import { useRef, useState } from 'react'
import { CONTACT, CTA, SITE, STATUS } from '@/lib/content'
import { scrollTo } from '@/lib/scroll'
import { useGSAP, ScrollTrigger, gsap } from '@/lib/gsap'
import { useReducedMotion } from '@/lib/useReducedMotion'

export function Footer() {
  const year = new Date().getFullYear()
  const reduced = useReducedMotion()
  const emailText = useRef<HTMLSpanElement>(null)
  const [secure, setSecure] = useState(reduced)

  // The email decrypts into place the first time the section is seen, then the
  // channel line flips to "established".
  useGSAP(
    () => {
      if (reduced || !emailText.current) return
      ScrollTrigger.create({
        trigger: '#contact',
        start: 'top 65%',
        once: true,
        onEnter: () => {
          gsap.to(emailText.current, {
            duration: 1.1,
            ease: 'none',
            scrambleText: { text: CONTACT.email, chars: 'lowerCase', speed: 0.8 },
            onComplete: () => setSecure(true),
          })
        },
      })
    },
    { dependencies: [reduced] },
  )

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
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <span className="font-mono text-xs text-accent">{STATUS.label}</span>
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

        <div className="mt-10" data-reveal>
          <a
            href={`mailto:${CONTACT.email}`}
            className="group inline-flex items-center gap-3 font-display text-2xl font-medium text-fg transition-colors hover:text-accent sm:text-4xl"
            data-magnetic
            data-cursor-label="MAIL"
          >
            <span ref={emailText}>{CONTACT.email}</span>
            <span className="transition-transform duration-300 group-hover:translate-x-2" aria-hidden>
              →
            </span>
          </a>
          <p className="mt-3 flex items-center gap-2 font-mono text-[0.68rem] tracking-[0.12em] text-faint">
            <span
              className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
                secure ? 'bg-accent' : 'bg-faint/60'
              }`}
              aria-hidden
            />
            {secure ? 'secure channel established · ready to connect' : 'establishing secure channel…'}
          </p>
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
