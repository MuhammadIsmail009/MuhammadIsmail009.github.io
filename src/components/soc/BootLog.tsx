import { useEffect, useRef, useState } from 'react'
import { SOC } from '@/lib/content'
import { useReducedMotion } from '@/lib/useReducedMotion'

/**
 * systemd-style boot sequence. Lines land one by one, then hands off to the
 * desktop. Click / any key skips; reduced motion boots instantly.
 */
export function BootLog({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(reduced ? SOC.bootLines.length : 0)
  const doneRef = useRef(false)

  const finish = () => {
    if (doneRef.current) return
    doneRef.current = true
    onDone()
  }

  useEffect(() => {
    if (reduced) {
      const id = window.setTimeout(finish, 250)
      return () => window.clearTimeout(id)
    }
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setShown(i)
      if (i >= SOC.bootLines.length) {
        window.clearInterval(id)
        window.setTimeout(finish, 650)
      }
    }, 260)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  useEffect(() => {
    const skip = () => {
      setShown(SOC.bootLines.length)
      finish()
    }
    window.addEventListener('keydown', skip)
    window.addEventListener('pointerdown', skip)
    return () => {
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const progress = Math.round((shown / SOC.bootLines.length) * 100)

  return (
    <div className="scanlines relative flex h-full flex-col justify-center bg-[#080706] px-6 sm:px-[14vw]">
      <p className="mb-8 font-display text-2xl font-semibold tracking-tight text-fg">
        {SOC.osName.split(' ')[0]} <span className="text-accent">SOC</span>
        <span className="ml-3 font-mono text-xs font-normal text-faint">{SOC.osName}</span>
      </p>

      <div className="font-mono text-xs leading-loose sm:text-sm" role="status" aria-live="polite">
        {SOC.bootLines.slice(0, shown).map((l) => (
          <p key={l} className="text-muted">
            <span className="text-data">{l.slice(0, 8)}</span>
            {l.slice(8)}
          </p>
        ))}
        {shown < SOC.bootLines.length ? (
          <span className="inline-block h-4 w-2 animate-blink bg-accent align-middle" aria-hidden />
        ) : null}
      </div>

      <div className="mt-10 h-px w-full max-w-md bg-hairline">
        <div
          className="h-full bg-accent transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-faint">
        initializing secure workstation — click to skip
      </p>
    </div>
  )
}
