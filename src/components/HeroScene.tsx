import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { SecurityGraph } from '@/components/three/SecurityGraph'

const MASK = 'radial-gradient(64% 64% at 64% 46%, #000 36%, transparent 100%)'

/**
 * R3F security-graph signature for the hero. Lazy default export so three.js is
 * code-split out of the initial bundle, and the render loop is frozen whenever
 * the hero scrolls out of view (frameloop="never") to protect battery + FPS.
 */
export default function HeroScene() {
  const wrap = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setPaused(!entry.isIntersecting), {
      threshold: 0.01,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrap} aria-hidden className="absolute inset-0">
      {/* CSS bloom underneath the graph (also the Suspense fallback look). */}
      <div
        className="absolute right-[-12%] top-1/2 h-[78vmin] w-[78vmin] -translate-y-1/2 rounded-full blur-[90px]"
        style={{ background: 'radial-gradient(circle, var(--accent-glow), transparent 64%)' }}
      />
      <Canvas
        frameloop={paused ? 'never' : 'always'}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 6], fov: 45 }}
        className="!absolute inset-0"
        style={{ maskImage: MASK, WebkitMaskImage: MASK }}
      >
        <SecurityGraph />
      </Canvas>
    </div>
  )
}
