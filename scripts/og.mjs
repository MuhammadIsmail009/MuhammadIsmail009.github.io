import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'

const b64 = (p) => readFileSync(p).toString('base64')
const clash = b64('public/fonts/ClashDisplay-Variable.woff2')
const mono = b64('public/fonts/JetBrainsMono-Variable.woff2')

// A small constellation for the right side (echoes the hero graph).
const NODES = [
  [940, 120], [1060, 90], [1000, 230], [880, 250],
  [1090, 300], [960, 360], [1080, 440], [900, 430],
]
const EDGES = [
  [0, 1], [0, 2], [0, 3], [2, 4], [2, 5], [3, 5], [4, 6], [5, 6], [5, 7], [3, 7],
]
const ACTIVE = new Set([0, 5, 6])
const lines = EDGES.map(
  ([a, b]) =>
    `<line x1="${NODES[a][0]}" y1="${NODES[a][1]}" x2="${NODES[b][0]}" y2="${NODES[b][1]}" stroke="rgba(240,133,58,0.30)" stroke-width="1.5"/>`,
).join('')
const dots = NODES.map(
  ([x, y], i) =>
    `<circle cx="${x}" cy="${y}" r="${ACTIVE.has(i) ? 7 : 4}" fill="${ACTIVE.has(i) ? '#F0853A' : 'rgba(242,240,236,0.45)'}"/>`,
).join('')

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Clash';src:url(data:font/woff2;base64,${clash}) format('woff2');font-weight:200 700;font-display:block}
@font-face{font-family:'Mono';src:url(data:font/woff2;base64,${mono}) format('woff2');font-weight:400 700;font-display:block}
*{margin:0;box-sizing:border-box}
html,body{width:1200px;height:630px}
body{background:#0B0A09;color:#F3F0EA;font-family:'Clash',sans-serif;overflow:hidden;position:relative}
.glow{position:absolute;right:-160px;top:50%;transform:translateY(-50%);width:760px;height:760px;border-radius:50%;
  background:radial-gradient(circle,rgba(240,133,58,0.22),transparent 60%);filter:blur(36px)}
.grain{position:absolute;inset:0;opacity:.04;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.wrap{position:absolute;inset:0;padding:0 92px;display:flex;flex-direction:column;justify-content:center}
.kicker{font-family:'Mono';font-size:21px;letter-spacing:.22em;text-transform:uppercase;color:#847C71;display:flex;align-items:center;gap:14px}
.kicker .dot{width:9px;height:9px;border-radius:50%;background:#F0853A;display:inline-block}
.name{font-size:138px;font-weight:600;line-height:.9;letter-spacing:-.02em;margin-top:26px}
.name .a{color:#F0853A;text-shadow:0 0 40px rgba(240,133,58,.35)}
.tag{margin-top:40px;font-size:44px;font-weight:500;letter-spacing:-.01em}
.tag .red{color:#F0853A}
.tag .blue{color:#5AC8BE}
.url{position:absolute;left:92px;bottom:60px;font-family:'Mono';font-size:23px;color:#847C71}
.bar{position:absolute;left:0;bottom:0;height:8px;width:100%;background:linear-gradient(90deg,#F0853A,#5AC8BE)}
svg.cons{position:absolute;right:60px;top:0;height:630px}
</style></head><body>
<div class="glow"></div>
<svg class="cons" width="1200" height="630" viewBox="0 0 1200 630">${lines}${dots}</svg>
<div class="grain"></div>
<div class="wrap">
  <div class="kicker"><span class="dot"></span>Cybersecurity Engineer · SOC &amp; Detection</div>
  <div class="name">Muhammad<br><span class="a">Ismail</span></div>
  <div class="tag"><span class="red">Attacker's mindset.</span> <span class="blue">Defender's discipline.</span></div>
</div>
<div class="url">muhammadismail009.github.io</div>
<div class="bar"></div>
</body></html>`

const run = async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
  await page.setContent(html, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: 'public/og.png' })
  await browser.close()
  console.log('✓ wrote public/og.png (1200x630)')
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
