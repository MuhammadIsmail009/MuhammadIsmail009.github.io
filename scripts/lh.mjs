import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import * as chromeLauncher from 'chrome-launcher'
import lighthouse from 'lighthouse'
import { chromium } from 'playwright'

const PORT = 4173
const BASE = `http://localhost:${PORT}/`

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

const RUNS = Number(process.env.RUNS || 1)

const once = async () => {
  const chrome = await chromeLauncher.launch({
    chromePath: chromium.executablePath(),
    chromeFlags: ['--headless=new', '--no-sandbox'],
  })
  // Default Lighthouse config = mobile form factor + Moto-G4 throttling.
  const { lhr } = await lighthouse(BASE, { port: chrome.port, output: 'json', logLevel: 'error' })
  try {
    await chrome.kill()
  } catch {}
  return lhr
}

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]

const run = async () => {
  const server = await startServer()

  if (RUNS > 1) {
    const perf = []
    for (let i = 0; i < RUNS; i++) {
      const lhr = await once()
      const s = Math.round(lhr.categories.performance.score * 100)
      perf.push(s)
      console.log(
        `run ${i + 1}: perf=${s} ` +
          `LCP=${(lhr.audits['largest-contentful-paint'].numericValue / 1000).toFixed(2)}s ` +
          `TBT=${Math.round(lhr.audits['total-blocking-time'].numericValue)}ms ` +
          `SI=${(lhr.audits['speed-index'].numericValue / 1000).toFixed(2)}s`,
      )
    }
    console.log(`\nperformance median=${median(perf)} (runs: ${perf.join(', ')})`)
    server.kill()
    return
  }

  const lhr = await once()
  const cat = lhr.categories
  const scores = {
    performance: Math.round(cat.performance.score * 100),
    accessibility: Math.round(cat.accessibility.score * 100),
    bestPractices: Math.round(cat['best-practices'].score * 100),
    seo: Math.round(cat.seo.score * 100),
  }
  const metrics = {
    LCP_s: +(lhr.audits['largest-contentful-paint'].numericValue / 1000).toFixed(2),
    FCP_s: +(lhr.audits['first-contentful-paint'].numericValue / 1000).toFixed(2),
    TBT_ms: Math.round(lhr.audits['total-blocking-time'].numericValue),
    CLS: +lhr.audits['cumulative-layout-shift'].numericValue.toFixed(3),
    SI_s: +(lhr.audits['speed-index'].numericValue / 1000).toFixed(2),
  }

  // Surface the audits that actually cost points (a11y/bp/seo).
  const failing = []
  for (const key of ['accessibility', 'best-practices', 'seo']) {
    const refs = cat[key].auditRefs.filter((r) => r.weight > 0)
    for (const r of refs) {
      const a = lhr.audits[r.id]
      if (a.score !== null && a.score < 1) failing.push(`[${key}] ${r.id} (${a.title})`)
    }
  }
  // Perf opportunities worth knowing.
  const perfHints = lhr.categories.performance.auditRefs
    .map((r) => lhr.audits[r.id])
    .filter((a) => a && a.details?.type === 'opportunity' && a.numericValue > 100)
    .map((a) => `${a.id}: ~${Math.round(a.numericValue)}ms`)

  console.log(JSON.stringify({ scores, metrics, failing, perfHints }, null, 2))
  writeFileSync('scripts/.verify/lh.json', JSON.stringify(lhr, null, 2))
  server.kill()
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
