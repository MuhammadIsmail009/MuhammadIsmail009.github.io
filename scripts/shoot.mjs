// Dev-only visual verification: capture desktop + mobile screenshots.
// Run with a global Playwright:  NODE_PATH=$(npm root -g) node scripts/shoot.mjs
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const URL = process.env.URL || 'http://localhost:4173/'
const OUT = 'screenshots'
mkdirSync(OUT, { recursive: true })

const targets = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]

const browser = await chromium.launch()
try {
  for (const t of targets) {
    const page = await browser.newPage({
      viewport: { width: t.width, height: t.height },
      deviceScaleFactor: 1,
    })
    // retry until the preview server is up
    for (let i = 0; i < 20; i++) {
      try {
        await page.goto(URL, { waitUntil: 'load', timeout: 4000 })
        break
      } catch {
        await page.waitForTimeout(1000)
      }
    }
    await page.waitForTimeout(2200) // let fonts + reveals settle
    await page.screenshot({ path: `${OUT}/${t.name}-hero.png` })
    await page.screenshot({ path: `${OUT}/${t.name}-full.png`, fullPage: true })
    console.log(`shot ${t.name}`)
    await page.close()
  }
} finally {
  await browser.close()
}
console.log('screenshots done →', OUT)
