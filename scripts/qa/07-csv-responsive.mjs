// QA módulo 07 — CSV download real + responsividade multi-viewport.
import { chromium } from 'playwright-core'
import { makeContext, makeReport, login, go, expectText, BASE, QA_EMAIL, QA_PASS, CHROME, sleep } from './lib.mjs'
import { readFileSync } from 'node:fs'

const rep = makeReport('07-csv-responsive')

// 1. CSV download real
{
  const { browser, page } = await makeContext()
  try {
    await login(page)
    await go(page, '/manage/settings')
    await expectText(page, 'Dados', 6000)
    const dlPromise = page.waitForEvent('download', { timeout: 10000 })
    await page.click('button:has-text("Exportar")')
    const dl = await dlPromise
    const path = await dl.path()
    const content = path ? readFileSync(path, 'utf8') : ''
    const hasHeader = /Nome.*Posição.*Geral/i.test(content)
    const lines = content.split('\n').filter(Boolean).length
    rep.step('Exportar CSV: download + cabeçalho + dados', hasHeader && lines >= 1 ? 'pass' : 'fail', `${await dl.suggestedFilename()}, ${lines} linhas`)
  } catch (e) {
    rep.step('Exportar CSV download', 'fail', e.message)
  } finally {
    await browser.close()
  }
}

// 2. Responsividade
for (const w of [320, 375, 390, 428]) {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true })
  const page = await browser.newPage({ viewport: { width: w, height: 844 }, acceptDownloads: true })
  try {
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' })
    await page.fill('input[type="email"]', QA_EMAIL)
    await page.fill('input[type="password"]', QA_PASS)
    await page.click('button[type="submit"]')
    await page.waitForURL(`${BASE}/`, { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    await sleep(400)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
    await page.screenshot({ path: `scripts/qa/shots/07-responsive-${w}.png` })
    rep.step(`Responsivo @ ${w}px sem overflow horizontal`, overflow ? 'fail' : 'pass')
  } catch (e) {
    rep.step(`Responsivo @ ${w}px`, 'fail', e.message)
  } finally {
    await browser.close()
  }
}

const r = rep.finish()
process.exit(r.fail > 0 ? 1 : 0)
