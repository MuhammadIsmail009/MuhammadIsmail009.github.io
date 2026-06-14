import { SmoothScroll } from '@/components/SmoothScroll'
import { SITE } from '@/lib/content'

export default function App() {
  return (
    <SmoothScroll>
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <p className="kicker mb-6">{SITE.kicker}</p>
          <h1 className="font-display text-[clamp(3.25rem,13vw,12rem)] font-semibold leading-[0.9] tracking-tight">
            Muhammad <span className="text-accent text-glow">Ismail</span>
          </h1>
          <p className="mx-auto mt-8 max-w-prose2 text-balance text-muted">
            Foundation booted — design tokens, self-hosted fonts, GSAP, and Lenis smooth
            scroll are wired.
          </p>
        </div>
      </main>
    </SmoothScroll>
  )
}
