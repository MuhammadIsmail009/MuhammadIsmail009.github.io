import { chromium } from 'playwright'
import { spawn } from 'node:child_process'

const PORT = 4173
const BASE = `http://localhost:${PORT}/`
const OUT = 'scripts/.verify'

const startServer = async () => {
  const proc = spawn('npm', ['run', 'preview'], { shell: true, stdio: 'ignore' })
  for (let i = 0; i < 40; i++) {
    try {
      if ((await fetch(BASE)).ok) return proc
    } catch {}
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error('preview did not start')
}

const goSection = async (page, sel, wait = 1100) => {
  await page.evaluate((s) => {
    document.querySelector(s)?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, sel)
  await page.waitForTimeout(wait)
}

const run = async () => {
  const server = await startServer()
  const browser = await chromium.launch()

  // ---- Desktop, full motion (3D scene mounts) ----
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await ctx.newPage()
    await page.goto(BASE, { waitUntil: 'networkidle' })
    await page.waitForTimeout(3600) // preloader + idle scene mount

    await page.screenshot({ path: `${OUT}/show-d1-hero.png` })

    await goSection(page, '#about')
    await page.screenshot({ path: `${OUT}/show-d2-about.png` })

    await goSection(page, '#work')
    await page.screenshot({ path: `${OUT}/show-d3-work.png` })

    await goSection(page, '#experience')
    await page.screenshot({ path: `${OUT}/show-d4-experience.png` })

    await goSection(page, '#stack')
    await page.screenshot({ path: `${OUT}/show-d5-stack.png` })

    // Terminal — type a command to show the easter egg working.
    await goSection(page, '#terminal')
    const input = page.locator('#term-input')
    await input.click()
    await input.type('whoami', { delay: 35 })
    await input.press('Enter')
    await input.type('f1', { delay: 35 })
    await input.press('Enter')
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${OUT}/show-d6-terminal.png` })

    await goSection(page, '#contact')
    await page.screenshot({ path: `${OUT}/show-d7-footer.png` })
    console.log('✓ desktop motion (hero, about, work, experience, stack, terminal, footer)')
    await ctx.close()
  }

  // ---- Mobile, full motion ----
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
    const page = await ctx.newPage()
    await page.goto(BASE, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2200)
    await page.screenshot({ path: `${OUT}/show-m1-hero.png` })
    await goSection(page, '#work')
    await page.screenshot({ path: `${OUT}/show-m2-work.png` })
    await goSection(page, '#stack')
    await page.screenshot({ path: `${OUT}/show-m3-stack.png` })
    console.log('✓ mobile motion (hero, work, stack)')
    await ctx.close()
  }

  await browser.close()
  server.kill()
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
