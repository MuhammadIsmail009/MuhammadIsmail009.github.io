import { useRef, useState } from 'react'
import { APPROACH } from '@/lib/content'
import { Section, SectionHeader } from '@/components/ui'
import { ScrollTrigger, useGSAP } from '@/lib/gsap'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { useMotionReady } from '@/lib/motionReady'

/**
 * One alert, four moves. A single real-world event (encoded PowerShell spawned
 * by Word) sits pinned beside the methodology, and each step transforms it:
 * fields get modeled, the rule matches, enrichment lands a verdict, and the
 * tuned rule ships. The methodology is demonstrated, not claimed.
 */

// The evidence — one pre-authored process-creation event.
// hl = which steps (0-based) highlight this line.
const EVENT_LINES: { text: string; hl?: number[] }[] = [
  { text: '{' },
  { text: '  "ts": "2026-07-08T09:14:22Z",' },
  { text: '  "host": "FIN-WKS-041",', hl: [2] },
  { text: '  "user": "j.doe",', hl: [2] },
  { text: '  "parent_image": "…\\\\Office16\\\\WINWORD.EXE",', hl: [0, 1] },
  { text: '  "image": "…\\\\v1.0\\\\powershell.exe",', hl: [0, 1] },
  { text: '  "cmdline": "powershell -nop -w hidden -enc JABzAD0A…",', hl: [0, 1] },
  { text: '  "logon_type": 2' },
  { text: '}' },
]

// What each step does to the evidence — caption + extra pane content.
const STEP_NOTES = [
  'A document editor becoming a shell’s parent is the surface. Model it before it ships: STRIDE the design, decide what “detected” must mean here.',
  'The rule fires on the modeled surface: parent is an Office app, child is PowerShell, command line carries an encoded payload.',
  'The alert becomes a question: how exploited is this in the wild, how much does this host matter? Enrichment answers it.',
  'The incident feeds back: the rule’s blind spots get patched and the control that kills the class lands in policy.',
]

function EvidencePane({ step }: { step: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-[#0c0b0a]">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5 font-mono text-[0.65rem] text-faint">
        <span>
          <span className="text-accent">evidence</span> · process_creation · FIN-WKS-041
        </span>
        <span className="tabular-nums">
          move {String(step + 1).padStart(2, '0')}/04
        </span>
      </div>

      {/* the raw event — fields light up as the steps model/match them */}
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[0.68rem] leading-relaxed sm:text-xs">
        {EVENT_LINES.map((l, i) => {
          const lit = l.hl?.includes(step)
          return (
            <div
              key={i}
              className={`transition-colors duration-500 ${
                lit ? 'text-fg' : 'text-faint'
              }`}
            >
              {lit ? (
                <span className="bg-accent/10 decoration-accent/60">{l.text}</span>
              ) : (
                l.text
              )}
            </div>
          )
        })}
      </pre>

      {/* step overlays — each move adds its own layer under the event */}
      <div className="space-y-2 border-t border-hairline px-4 py-4 font-mono text-[0.68rem] leading-relaxed sm:text-xs">
        {step === 0 ? (
          <p className="text-muted">
            <span className="text-accent">surface —</span> office app → child shell → encoded
            command. Three fields to watch; that is the model.
          </p>
        ) : null}

        {step >= 1 ? (
          <div className={step === 1 ? '' : 'opacity-45'}>
            <p className="text-muted">
              <span className="text-data">match —</span> condition: selection_parent
              <span className="text-faint"> and </span>selection_child
            </p>
            <p className="mt-1 flex flex-wrap gap-2">
              <span className="rounded-full border border-data/40 px-2 py-0.5 text-[0.6rem] text-data">
                ATT&amp;CK T1059.001
              </span>
              <span className="rounded-full border border-data/40 px-2 py-0.5 text-[0.6rem] text-data">
                T1566.001 maldoc
              </span>
            </p>
          </div>
        ) : null}

        {step >= 2 ? (
          <div className={step === 2 ? '' : 'opacity-45'}>
            <p className="text-muted">
              <span className="text-data">enrich —</span> EPSS 0.94 · CISA KEV: listed · host:
              finance workstation
            </p>
            <p className="mt-1">
              <span className="rounded-full border border-accent/50 bg-accent/10 px-2 py-0.5 text-[0.6rem] text-accent">
                verdict: HIGH — escalate, contain host
              </span>
            </p>
          </div>
        ) : null}

        {step >= 3 ? (
          <div>
            <p className="text-muted">
              <span className="text-data">harden —</span> tune the rule, kill the class:
            </p>
            <p className="mt-1 text-accent/80">
              -&nbsp;&nbsp;CommandLine|contains: '-enc'
            </p>
            <p className="text-data">
              +&nbsp;&nbsp;CommandLine|contains: ['-enc', '-e ', '-ec ']
            </p>
            <p className="text-data">+&nbsp;&nbsp;control: block unsigned macros (NIST CSF PR.PT)</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function Approach() {
  const reduced = useReducedMotion()
  const ready = useMotionReady()
  const [step, setStep] = useState(0)
  const stepRefs = useRef<(HTMLLIElement | null)[]>([])

  // Desktop: scrolling the step list drives which move is live.
  useGSAP(
    () => {
      if (reduced || !ready) return
      if (!window.matchMedia('(min-width: 1024px)').matches) return
      stepRefs.current.forEach((el, i) => {
        if (!el) return
        ScrollTrigger.create({
          trigger: el,
          start: 'top 62%',
          end: 'bottom 62%',
          onEnter: () => setStep(i),
          onEnterBack: () => setStep(i),
        })
      })
    },
    { dependencies: [ready, reduced] },
  )

  return (
    <Section id="approach" className="py-section">
      <SectionHeader
        index="/ 02"
        label={APPROACH.kicker}
        title={APPROACH.title}
        description="Watch it happen: one real alert, walked through all four moves."
        className="mb-14"
      />

      {/* mobile / tablet: tap through the moves */}
      <div className="mb-6 flex gap-2 lg:hidden" role="tablist" aria-label="Methodology steps">
        {APPROACH.steps.map((s, i) => (
          <button
            key={s.n}
            type="button"
            role="tab"
            aria-selected={step === i}
            onClick={() => setStep(i)}
            className={`rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors ${
              step === i
                ? 'border-accent/60 bg-accent/10 text-accent'
                : 'border-hairline text-muted'
            }`}
          >
            {s.n} {s.title}
          </button>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,34rem)] lg:gap-14">
        {/* the four moves */}
        <ol className="hidden lg:block">
          {APPROACH.steps.map((s, i) => (
            <li
              key={s.n}
              ref={(el) => {
                stepRefs.current[i] = el
              }}
              className={`border-l py-14 pl-8 transition-colors duration-500 first:pt-2 last:pb-2 ${
                step === i ? 'border-accent/70' : 'border-hairline'
              }`}
            >
              <span
                className={`font-display text-5xl font-semibold transition-colors duration-500 ${
                  step === i ? 'text-accent/40' : 'text-surface-2'
                }`}
                aria-hidden
              >
                {s.n}
              </span>
              <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight text-fg">
                {s.title}
              </h3>
              <p className="mt-3 max-w-prose text-pretty leading-relaxed text-muted">{s.body}</p>
              <p
                className={`mt-4 max-w-prose font-mono text-xs leading-relaxed transition-opacity duration-500 ${
                  step === i ? 'text-faint opacity-100' : 'opacity-0'
                }`}
                aria-hidden={step !== i}
              >
                {STEP_NOTES[i]}
              </p>
            </li>
          ))}
        </ol>

        {/* mobile step copy */}
        <div className="lg:hidden">
          <h3 className="font-display text-2xl font-semibold tracking-tight text-fg">
            {APPROACH.steps[step].title}
          </h3>
          <p className="mt-3 text-pretty leading-relaxed text-muted">
            {APPROACH.steps[step].body}
          </p>
        </div>

        {/* the evidence — pinned on desktop, inline on mobile */}
        <div className="lg:sticky lg:top-28 lg:self-start" data-reveal>
          <EvidencePane step={step} />
        </div>
      </div>
    </Section>
  )
}
