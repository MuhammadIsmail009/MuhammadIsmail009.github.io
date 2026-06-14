import { gsap } from '@/lib/gsap'

/**
 * Attaches magnetic-hover behaviour to every [data-magnetic] under `root`.
 * The element eases toward the pointer while hovered and springs back on leave.
 * Returns a cleanup that removes all listeners and resets transforms.
 *
 * No-op-safe: callers must skip this under reduced motion / coarse pointers.
 */
export function initMagnetics(root: ParentNode = document, strength = 0.4): () => void {
  const els = Array.from(root.querySelectorAll<HTMLElement>('[data-magnetic]'))
  const cleanups: Array<() => void> = []

  els.forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' })

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      xTo((e.clientX - (r.left + r.width / 2)) * strength)
      yTo((e.clientY - (r.top + r.height / 2)) * strength)
    }
    const onLeave = () => {
      xTo(0)
      yTo(0)
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    cleanups.push(() => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      gsap.killTweensOf(el)
      gsap.set(el, { x: 0, y: 0 })
    })
  })

  return () => cleanups.forEach((fn) => fn())
}
