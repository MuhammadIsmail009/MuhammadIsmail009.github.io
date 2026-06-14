import { chromium } from 'playwright'
import { spawn } from 'node:child_process'

const PORT = 4173
const BASE = process.env.BASE || `http://localhost:${PORT}/`
const OUT = 'scripts/.verify'

/** Spawn `vite preview` and resolve once it answers (skipped if BASE is preset). */
const startServer = async () => {
  if (process.env.BASE) return null
  const proc = spawn('npm', ['run', 'preview'], { shell: true, stdio: 'ignore' })
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(BASE)
      if (r.ok) return proc
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error('preview server did not start')
}

const collect = (page, bag) => {
  page.on('console', (m) => {
    if (m.type() === 'error') bag.push(`console.error: ${m.text()}`)
  })
  page.on('pageerror', (e) => bag.push(`pageerror: ${e.message}`))
  page.on('requestfailed', (r) =>
    bag.push(`requestfailed: ${r.url()} ${r.failure()?.errorText ?? ''}`),
  )
}

const run = async () => {
  const server = await startServer()
  const browser = await chromium.launch()
  const results = {}

  // ---- Pass A: full motion path -------------------------------------------
  {
    const errors = []
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await ctx.newPage()
    collect(page, errors)
    await page.goto(BASE, { waitUntil: 'networkidle' })

    // Preloader should exist then disappear (curtain lift ~2.5s).
    await page.waitForTimeout(3500)

    const canvas = await page.locator('#hero canvas').count()
    const heroH1 = (await page.locator('#hero h1').innerText()).replace(/\s+/g, ' ').trim()
    await page.screenshot({ path: `${OUT}/A-hero.png` })

    // Scroll through to trigger reveals, screenshot work + footer.
    await page.evaluate(() => document.querySelector('#work')?.scrollIntoView())
    await page.waitForTimeout(1200)
    await page.screenshot({ path: `${OUT}/A-work.png` })
    await page.evaluate(() => document.querySelector('#contact')?.scrollIntoView())
    await page.waitForTimeout(1200)
    const ctaVisible = await page.locator('#contact h2').isVisible()
    await page.screenshot({ path: `${OUT}/A-footer.png` })

    results.motion = { canvas, heroH1, ctaVisible, errors }
    await ctx.close()
  }

  // ---- Pass B: reduced motion ---------------------------------------------
  {
    const errors = []
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    })
    const page = await ctx.newPage()
    collect(page, errors)
    await page.goto(BASE, { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)

    const preloader = await page.locator('[data-pre-bar]').count()
    const canvas = await page.locator('#hero canvas').count()
    // Everything should be visible without scrolling (no reveal hiding).
    const footerOpacity = await page
      .locator('#contact h2')
      .evaluate((el) => getComputedStyle(el).opacity)
    await page.screenshot({ path: `${OUT}/B-reduced-full.png`, fullPage: true })

    results.reduced = { preloader, canvas, footerOpacity, errors }
    await ctx.close()
  }

  await browser.close()
  server?.kill()
  console.log(JSON.stringify(results, null, 2))

  const allErrors = [...results.motion.errors, ...results.reduced.errors]
  if (allErrors.length) {
    console.log('\n❌ ERRORS FOUND:')
    allErrors.forEach((e) => console.log('  - ' + e))
    process.exit(1)
  }
  console.log('\n✅ no console/page errors')
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
