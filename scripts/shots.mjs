import { chromium } from 'playwright'
import { spawn } from 'node:child_process'

const PORT = 4173
const BASE = process.env.BASE || `http://localhost:${PORT}/`
const OUT = 'scripts/.verify'

const startServer = async () => {
  if (process.env.BASE) return null
  const proc = spawn('npm', ['run', 'preview'], { shell: true, stdio: 'ignore' })
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(BASE)
      if (r.ok) return proc
    } catch {}
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error('preview server did not start')
}

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
]

const run = async () => {
  const server = await startServer()
  const browser = await chromium.launch()

  for (const vp of VIEWPORTS) {
    // Reduced motion => all content visible without scroll-trigger timing.
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      reducedMotion: 'reduce',
      deviceScaleFactor: 1,
    })
    const page = await ctx.newPage()
    await page.goto(BASE, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${OUT}/shot-${vp.name}.png`, fullPage: true })
    console.log(`✓ ${vp.name} (${vp.width}px)`)
    await ctx.close()
  }

  // Mobile nav open state (motion ctx so the toggle behaves normally).
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
    const page = await ctx.newPage()
    await page.goto(BASE, { waitUntil: 'networkidle' })
    await page.waitForTimeout(3200) // let preloader clear
    await page.locator('button[aria-label="Open menu"]').click()
    await page.waitForTimeout(700)
    await page.screenshot({ path: `${OUT}/shot-mobile-nav.png` })
    console.log('✓ mobile-nav-open')
    await ctx.close()
  }

  await browser.close()
  server?.kill()
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
