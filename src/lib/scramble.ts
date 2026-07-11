import { gsap } from '@/lib/gsap'

/**
 * Hover decrypt: any element carrying `data-scramble` re-resolves its own text
 * through a scramble on mouseenter. Fine-pointer only; callers gate on reduced
 * motion. Returns a cleanup that removes all listeners.
 */
export function initScramble(root: ParentNode = document): () => void {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {}

  const cleanups: (() => void)[] = []
  root.querySelectorAll<HTMLElement>('[data-scramble]').forEach((el) => {
    const text = el.textContent ?? ''
    if (!text.trim()) return
    const onEnter = () => {
      gsap.to(el, {
        duration: 0.6,
        ease: 'none',
        scrambleText: { text, chars: 'upperCase', speed: 1.2 },
        overwrite: 'auto',
      })
    }
    el.addEventListener('mouseenter', onEnter)
    cleanups.push(() => {
      el.removeEventListener('mouseenter', onEnter)
      gsap.killTweensOf(el)
      el.textContent = text
    })
  })
  return () => cleanups.forEach((fn) => fn())
}
