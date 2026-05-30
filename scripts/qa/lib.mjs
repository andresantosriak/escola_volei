// Biblioteca compartilhada do harness de QA E2E (Playwright + Chrome real).
import { chromium } from 'playwright-core'
import { mkdirSync, writeFileSync } from 'node:fs'

export const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
export const BASE = process.env.QA_BASE || 'http://localhost:5173'
export const QA_EMAIL = process.env.QA_EMAIL || 'qa.bot@gmail.com'
export const QA_PASS = process.env.QA_PASS || 'qa123456'
export const SHOT_DIR = 'scripts/qa/shots'

mkdirSync(SHOT_DIR, { recursive: true })

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function makeContext(opts = {}) {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true })
  const page = await browser.newPage({
    viewport: opts.viewport || { width: 390, height: 844 },
    acceptDownloads: true,
  })
  const consoleErrors = []
  const netErrors = []
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text())
  })
  page.on('pageerror', (e) => consoleErrors.push('PAGEERROR: ' + e.message))
  page.on('requestfailed', (r) => {
    const u = r.url()
    if (u.includes('/@vite') || u.startsWith('ws://')) return
    netErrors.push(`${r.failure()?.errorText} ${u}`)
  })
  page.on('response', (r) => {
    if (r.status() >= 400 && !r.url().includes('/@vite')) netErrors.push(`HTTP ${r.status()} ${r.url()}`)
  })
  return { browser, page, consoleErrors, netErrors }
}

export function makeReport(module) {
  const steps = []
  return {
    module,
    steps,
    step(name, status, detail = '', ms = null) {
      const icon = status === 'pass' ? '✅' : status === 'warn' ? '⚠️ ' : '❌'
      steps.push({ name, status, detail, ms })
      const t = ms != null ? ` (${ms}ms)` : ''
      console.log(`${icon} ${name}${t}${detail ? ' — ' + detail : ''}`)
    },
    async shot(page, name) {
      const path = `${SHOT_DIR}/${module}-${name}.png`
      await page.screenshot({ path }).catch(() => {})
      return path
    },
    finish() {
      const fail = steps.filter((s) => s.status === 'fail').length
      const warn = steps.filter((s) => s.status === 'warn').length
      const pass = steps.filter((s) => s.status === 'pass').length
      console.log(`\n── ${module}: ${pass} pass, ${warn} warn, ${fail} fail ──`)
      writeFileSync(`${SHOT_DIR}/${module}-report.json`, JSON.stringify({ module, pass, warn, fail, steps }, null, 2))
      return { pass, warn, fail }
    },
  }
}

/** Login padrão do QA bot; deixa a página em /. */
export async function login(page, rep) {
  const t0 = Date.now()
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('input[type="email"]', { timeout: 10000 })
  await page.fill('input[type="email"]', QA_EMAIL)
  await page.fill('input[type="password"]', QA_PASS)
  await page.click('button[type="submit"]')
  await page.waitForURL(`${BASE}/`, { timeout: 15000 })
  await page.waitForLoadState('networkidle')
  rep && rep.step('Login do coach de QA', 'pass', QA_EMAIL, Date.now() - t0)
}

/** Navega direto por URL (robusto p/ SPA). */
export async function go(page, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle')
}

/** Polling: espera um texto aparecer no body. */
export async function expectText(page, text, timeout = 8000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    const body = await page.textContent('body').catch(() => '')
    if (body && body.includes(text)) return true
    await sleep(200)
  }
  return false
}

/** Polling com regex. */
export async function expectMatch(page, regex, timeout = 8000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    const body = await page.textContent('body').catch(() => '')
    if (body && regex.test(body)) return true
    await sleep(200)
  }
  return false
}

export async function gotoTab(page, name) {
  await page.click(`text=${name}`)
  await page.waitForLoadState('networkidle')
  await sleep(400)
}
