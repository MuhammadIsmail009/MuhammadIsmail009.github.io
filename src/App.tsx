import { useState } from 'react'
import { SmoothScroll } from '@/components/SmoothScroll'
import { Grain } from '@/components/Grain'
import { Cursor } from '@/components/Cursor'
import { Chrome } from '@/components/Chrome'
import { CommandPalette } from '@/components/CommandPalette'
import { Preloader } from '@/components/Preloader'
import { MotionLayer } from '@/components/MotionLayer'
import { Nav } from '@/components/Nav'
import { Hero } from '@/components/Hero'
import { Marquee } from '@/components/Marquee'
import { About } from '@/components/About'
import { Approach } from '@/components/Approach'
import { Stats } from '@/components/Stats'
import { Work } from '@/components/Work'
import { Archive } from '@/components/Archive'
import { Experience } from '@/components/Experience'
import { Stack } from '@/components/Stack'
import { Terminal } from '@/components/Terminal'
import { Footer } from '@/components/Footer'
import { MotionReadyContext } from '@/lib/motionReady'
import { useReducedMotion } from '@/lib/useReducedMotion'

export default function App() {
  const reduced = useReducedMotion()
  // Reduced motion skips the preloader entirely: content is ready immediately.
  const [ready, setReady] = useState(reduced)
  const [showPreloader, setShowPreloader] = useState(!reduced)

  return (
    <MotionReadyContext.Provider value={ready}>
      {showPreloader ? (
        <Preloader onReveal={() => setReady(true)} onDone={() => setShowPreloader(false)} />
      ) : null}

      {!reduced ? <Cursor /> : null}

      <SmoothScroll>
        <a
          href="#main"
          className="sr-only-custom focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-canvas"
        >
          Skip to content
        </a>
        <Grain />
        <Chrome />
        <CommandPalette />
        <Nav />
        <main id="main">
          <Hero />
          <Marquee />
          <About />
          <Approach />
          <Stats />
          <Work />
          <Archive />
          <Experience />
          <Stack />
          <Terminal />
          <Footer />
        </main>
      </SmoothScroll>

      <MotionLayer ready={ready} />
    </MotionReadyContext.Provider>
  )
}
