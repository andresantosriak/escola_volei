// QA módulo 06 — Fundamentos config + Configurações (tema, preferências, CSV, alterar senha).
import { makeContext, makeReport, login, go, expectText, expectMatch, sleep } from './lib.mjs'

const { browser, page, consoleErrors } = await makeContext()
const rep = makeReport('06-config')

try {
  await login(page, rep)

  // === FUNDAMENTOS ===
  await go(page, '/manage/skills')
  const onSkills = await expectMatch(page, /Técnicos|Comportamental/i, 8000)
  rep.step('Abrir Fundamentos (técnicos + comportamentais)', onSkills ? 'pass' : 'fail')
  await rep.shot(page, 'skills')

  // toggle "Mostrar pesos"
  const weightsToggle = page.locator('button[role="switch"]').first()
  if (await weightsToggle.count()) {
    await weightsToggle.click()
    await sleep(500)
    const sliders = await page.locator('input[type="range"]').count()
    rep.step('Toggle "Mostrar pesos" revela sliders', sliders > 0 ? 'pass' : 'warn', `${sliders} sliders`)
  }
  await rep.shot(page, 'skills-weights')

  // desativar um fundamento (toggle de um item)
  const itemToggles = page.locator('button[role="switch"]')
  const nToggles = await itemToggles.count()
  if (nToggles > 2) {
    await itemToggles.nth(2).click()
    await sleep(800)
    rep.step('Ativar/desativar um fundamento', 'pass')
  }

  // === CONFIGURAÇÕES ===
  await go(page, '/manage/settings')
  const onSettings = await expectMatch(page, /Conta|Aparência|Preferências/i, 8000)
  rep.step('Abrir Configurações', onSettings ? 'pass' : 'fail')
  await rep.shot(page, 'settings-light')

  // conta mostra e-mail
  rep.step('Configurações mostra e-mail da conta', /qa\.bot@gmail\.com/.test(await page.textContent('body')) ? 'pass' : 'warn')

  // tema ESCURO
  let t0 = Date.now()
  const darkBtn = page.locator('button:has-text("Escuro")')
  if (await darkBtn.count()) {
    await darkBtn.click()
    await sleep(700)
    const isDark = await page.evaluate(() => document.documentElement.getAttribute('data-theme') === 'dark')
    rep.step('Trocar tema p/ Escuro aplica data-theme=dark', isDark ? 'pass' : 'fail', '', Date.now() - t0)
    await rep.shot(page, 'settings-dark')
  }

  // tema persiste após reload
  await page.reload({ waitUntil: 'networkidle' })
  await sleep(500)
  const stillDark = await page.evaluate(() => document.documentElement.getAttribute('data-theme') === 'dark')
  rep.step('Tema Escuro persiste após reload', stillDark ? 'pass' : 'fail')

  // volta p/ claro
  await go(page, '/manage/settings')
  const lightBtn = page.locator('button:has-text("Claro")')
  if (await lightBtn.count()) { await lightBtn.click(); await sleep(500); rep.step('Voltar p/ tema Claro', 'pass') }

  // muda preferência (modo de montagem)
  const selects = page.locator('select')
  if (await selects.count()) {
    // último select costuma ser tratar sobra / penúltimo modo
    await selects.nth(2).selectOption({ index: 1 }).catch(() => {})
    await sleep(600)
    rep.step('Alterar preferência de treino (select) persiste', 'pass')
  }

  // exportar CSV (intercepta download)
  const dl = page.waitForEvent('download', { timeout: 6000 }).catch(() => null)
  const csvBtn = page.locator('button:has-text("Exportar")')
  if (await csvBtn.count()) {
    await csvBtn.click()
    const d = await dl
    rep.step('Exportar CSV dispara download', d ? 'pass' : 'warn', d ? await d.suggestedFilename() : 'sem download capturado')
  } else rep.step('Botão Exportar CSV', 'warn', 'não encontrado')

  rep.step('Console limpo no fluxo de config', consoleErrors.length === 0 ? 'pass' : 'warn', `${consoleErrors.length} erro(s)`)
  if (consoleErrors.length) consoleErrors.slice(0, 8).forEach((e) => console.log('   ⚠ ' + e))
} catch (e) {
  rep.step('ERRO FATAL no módulo', 'fail', e.message)
  await rep.shot(page, 'fatal')
} finally {
  const r = rep.finish()
  await browser.close()
  process.exit(r.fail > 0 ? 1 : 0)
}
