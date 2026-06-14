import { SmoothScroll } from '@/components/SmoothScroll'
import { Grain } from '@/components/Grain'
import { Nav } from '@/components/Nav'
import { Hero } from '@/components/Hero'
import { Marquee } from '@/components/Marquee'
import { About } from '@/components/About'
import { Stats } from '@/components/Stats'
import { Work } from '@/components/Work'
import { Experience } from '@/components/Experience'
import { Stack } from '@/components/Stack'
import { Terminal } from '@/components/Terminal'
import { Footer } from '@/components/Footer'

export default function App() {
  return (
    <SmoothScroll>
      <a
        href="#main"
        className="sr-only-custom focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-canvas"
      >
        Skip to content
      </a>
      <Grain />
      <Nav />
      <main id="main">
        <Hero />
        <Marquee />
        <About />
        <Stats />
        <Work />
        <Experience />
        <Stack />
        <Terminal />
        <Footer />
      </main>
    </SmoothScroll>
  )
}
