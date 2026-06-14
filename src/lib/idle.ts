/**
 * Run a callback when the browser is idle, falling back to a short timeout where
 * requestIdleCallback is unavailable (older Safari). Returns a cancel fn.
 */
export function onIdle(cb: () => void, timeout = 1200): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(cb, { timeout })
    return () => window.cancelIdleCallback(id)
  }
  const id = window.setTimeout(cb, 300)
  return () => window.clearTimeout(id)
}
