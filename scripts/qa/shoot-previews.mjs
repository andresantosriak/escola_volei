// Renderiza cada preview HTML do design system e captura screenshot (referência visual).
import { chromium } from 'playwright-core'
import { readdirSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PREV_DIR = resolve('design-system/preview')
const OUT = 'scripts/qa/shots/ds-previews'
mkdirSync(OUT, { recursive: true })

const files = readdirSync(PREV_DIR).filter((f) => f.endsWith('.html') && !f.includes('?'))
const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage({ viewport: { width: 480, height: 900 } })

for (const f of files) {
  const name = f.replace('.html', '')
  try {
    await page.goto(`file://${PREV_DIR}/${f}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(800) // lucide icons
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true })
    console.log(`✅ ${name}`)
  } catch (e) {
    console.log(`❌ ${name}: ${e.message}`)
  }
}
await browser.close()
console.log(`\n${files.length} previews renderizados em ${OUT}`)
