/**
 * Cheap one-shot WebGL capability probe. Used to decide whether to mount the
 * R3F hero scene at all — on devices/contexts without WebGL (blocked, low-end,
 * GPU-disabled headless) we keep the SVG fallback instead of letting three.js
 * throw "Error creating WebGL context" and take the render tree down with it.
 */
let cached: boolean | null = null

export function supportsWebGL(): boolean {
  if (cached !== null) return cached
  if (typeof window === 'undefined' || !window.WebGLRenderingContext) {
    cached = false
    return cached
  }
  try {
    const canvas = document.createElement('canvas')
    cached = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
  } catch {
    cached = false
  }
  return cached
}
