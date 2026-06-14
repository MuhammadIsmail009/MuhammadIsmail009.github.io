import type Lenis from 'lenis'

/**
 * Module-level Lenis handle so non-React call sites (nav links, footer
 * back-to-top) can drive smooth scroll without prop drilling. Falls back to
 * native scrollIntoView when Lenis is absent (reduced-motion / not yet mounted).
 */
let instance: Lenis | null = null

export function setLenis(l: Lenis | null): void {
  instance = l
}

interface ScrollOpts {
  offset?: number
  duration?: number
}

export function scrollTo(target: string | number | HTMLElement, opts: ScrollOpts = {}): void {
  const offset = opts.offset ?? -72
  if (instance) {
    instance.scrollTo(target, { offset, duration: opts.duration ?? 1.2 })
    return
  }
  if (typeof target === 'string') {
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } else if (target instanceof HTMLElement) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } else {
    window.scrollTo({ top: target, behavior: 'smooth' })
  }
}
