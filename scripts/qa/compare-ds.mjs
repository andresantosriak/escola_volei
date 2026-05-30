// Captura cada bloco do /__showcase (componentes reais do app) recortado por [data-shot],
// e o preview HTML correspondente, no MESMO tamanho, para comparação visual 1:1.
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE = 'http://localhost:5173'
const PREV = resolve('design-system/preview')
const OUT = 'scripts/qa/shots/compare'
mkdirSync(OUT, { recursive: true })

// shot id no showcase  ↔  arquivo de preview
const PAIRS = [
  ['playercard', 'comp-playercard.html'],
  ['resultado', 'comp-resultado.html'],
  ['presenca', 'comp-presenca.html'],
  ['statbadge', 'comp-statbadge.html'],
  ['avaliacao', 'comp-avaliacao.html'],
  ['equilibrio', 'comp-equilibrio.html'],
  ['buttons', 'comp-buttons.html'],
]

const browser = await chromium.launch({ executablePath: CHROME, headless: true })

// 1. app showcase — recorta cada bloco
const app = await browser.newPage({ viewport: { width: 480, height: 2400 }, deviceScaleFactor: 2 })
const errs = []
app.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
app.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message))
// Vite pode estar re-otimizando deps logo após um build → retry com reload até montar.
let mounted = false
for (let attempt = 1; attempt <= 4 && !mounted; attempt++) {
  try {
    await app.goto(`${BASE}/__showcase`, { waitUntil: 'domcontentloaded', timeout: 20000 })
    await app.waitForSelector('[data-shot]', { timeout: 20000, state: 'attached' })
    mounted = true
  } catch {
    console.log(`… tentativa ${attempt}: showcase ainda não montou, recarregando`)
    await app.waitForTimeout(3000)
  }
}
if (!mounted) {
  console.log('⛔ showcase não montou nenhum [data-shot] após 4 tentativas')
  if (errs.length) console.log('   erros:', errs.slice(0, 5).join(' | '))
}
await app.waitForTimeout(1000)
for (const [id] of PAIRS) {
  const el = app.locator(`[data-shot="${id}"]`)
  if (await el.count()) {
    await el.scrollIntoViewIfNeeded()
    await el.screenshot({ path: `${OUT}/app-${id}.png` })
    console.log(`app ✅ ${id}`)
  } else {
    console.log(`app ❌ ${id} (bloco não encontrado)`)
  }
}
if (errs.length) console.log('console:', errs.slice(0, 5).join(' | '))
await app.close()

// 2. previews
const prev = await browser.newPage({ viewport: { width: 480, height: 900 }, deviceScaleFactor: 2 })
for (const [id, file] of PAIRS) {
  await prev.goto(`file://${PREV}/${file}`, { waitUntil: 'networkidle' })
  await prev.waitForTimeout(700)
  await prev.screenshot({ path: `${OUT}/prev-${id}.png`, fullPage: true })
  console.log(`prev ✅ ${id}`)
}
await prev.close()
await browser.close()
console.log(`\ncomparações em ${OUT}/  (app-*.png vs prev-*.png)`)
