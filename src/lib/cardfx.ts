import { gsap } from '@/lib/gsap'

/**
 * Card hover physics, fine-pointer only:
 *   [data-tilt]      → subtle 3D tilt toward the cursor (±8°)
 *   [data-spotlight] → tracks --mx/--my custom props for the CSS spotlight glow
 * One element may carry both. Returns a cleanup removing all listeners.
 */
export function initCardFX(root: ParentNode = document): () => void {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {}

  const cleanups: (() => void)[] = []

  root.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    gsap.set(el, { transformPerspective: 900, transformOrigin: 'center' })
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3' })
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3' })
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      ry(((e.clientX - (r.left + r.width / 2)) / r.width) * 8)
      rx((-(e.clientY - (r.top + r.height / 2)) / r.height) * 8)
    }
    const onLeave = () => {
      rx(0)
      ry(0)
    }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    cleanups.push(() => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      gsap.set(el, { clearProps: 'transform' })
    })
  })

  root.querySelectorAll<HTMLElement>('[data-spotlight]').forEach((el) => {
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
      el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
    }
    el.addEventListener('mousemove', onMove, { passive: true })
    cleanups.push(() => el.removeEventListener('mousemove', onMove))
  })

  return () => cleanups.forEach((fn) => fn())
}
