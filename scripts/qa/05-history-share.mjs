// QA módulo 05 — Histórico, Detalhe da partida e Compartilhar (gerador de imagem).
import { makeContext, makeReport, login, go, expectText, expectMatch, sleep } from './lib.mjs'

const { browser, page, consoleErrors } = await makeContext()
const rep = makeReport('05-history-share')

try {
  await login(page, rep)

  // 1. HISTÓRICO (módulo 04 registrou ao menos 1 partida)
  await go(page, '/history')
  const hasMatch = await expectMatch(page, /Time A|Treino|×/i, 8000)
  rep.step('Histórico lista partida registrada', hasMatch ? 'pass' : 'fail')
  await rep.shot(page, 'history-list')

  // abre primeiro ResultCard
  const card = page.locator('button:has-text("Time A"), button:has-text("×")').first()
  let openedDetail = false
  if (await card.count()) {
    await card.click()
    openedDetail = await expectMatch(page, /Detalhe da partida/i, 8000)
  }
  rep.step('Abrir detalhe da partida', openedDetail ? 'pass' : 'fail')
  await rep.shot(page, 'match-detail')

  if (openedDetail) {
    // 2. DETALHE: set-by-set, elencos, equilíbrio
    const detailBody = await page.textContent('body')
    rep.step('Detalhe mostra placar set-a-set', /Set 1/i.test(detailBody) ? 'pass' : 'warn')
    rep.step('Detalhe mostra equilíbrio da montagem', /Equilíbrio/i.test(detailBody) ? 'pass' : 'warn')
    rep.step('Detalhe mostra elencos dos times', /Treino [A-G]/.test(detailBody) ? 'pass' : 'warn')

    // 3. COMPARTILHAR resultado
    const shareBtn = page.locator('button:has-text("Compartilhar resultado")')
    if (await shareBtn.count()) {
      let t0 = Date.now()
      await shareBtn.click()
      const onShare = await expectText(page, 'Compartilhar', 8000)
      rep.step('Detalhe → tela Compartilhar', onShare ? 'pass' : 'fail', '', Date.now() - t0)
      await sleep(1200) // gera preview
      await rep.shot(page, 'share-square-green')

      // troca formato Vertical
      const vert = page.locator('button:has-text("Vertical")')
      if (await vert.count()) { await vert.click(); await sleep(800); rep.step('Trocar formato p/ Vertical', 'pass') }
      // troca tema Escuro
      const dark = page.locator('button:has-text("Escuro")')
      if (await dark.count()) { await dark.click(); await sleep(800); rep.step('Trocar tema p/ Escuro', 'pass') }
      await rep.shot(page, 'share-vertical-dark')
      // toggle incluir elencos
      const toggle = page.locator('button[role="switch"]').first()
      if (await toggle.count()) { await toggle.click(); await sleep(600); rep.step('Toggle de conteúdo (elencos)', 'pass') }
      await rep.shot(page, 'share-toggled')
    } else {
      rep.step('Botão "Compartilhar resultado" no detalhe', 'warn', 'não encontrado')
    }
  }

  // 4. COMPARTILHAR player card (via perfil de aluno)
  await go(page, '/students')
  const firstStudent = page.locator('button:has-text("Treino")').first()
  if (await firstStudent.count()) {
    await firstStudent.click()
    await sleep(600)
    await page.click('text=Desempenho')
    await sleep(600)
    const shareCard = page.locator('button:has-text("Compartilhar card")')
    if (await shareCard.count()) {
      await shareCard.click()
      const onShareCard = await expectText(page, 'Compartilhar', 8000)
      await sleep(1200)
      rep.step('Compartilhar player card do aluno', onShareCard ? 'pass' : 'warn')
      await rep.shot(page, 'share-playercard')
    } else rep.step('Botão "Compartilhar card"', 'warn', 'não encontrado')
  }

  rep.step('Console limpo no fluxo de histórico/share', consoleErrors.length === 0 ? 'pass' : 'warn', `${consoleErrors.length} erro(s)`)
  if (consoleErrors.length) consoleErrors.slice(0, 8).forEach((e) => console.log('   ⚠ ' + e))
} catch (e) {
  rep.step('ERRO FATAL no módulo', 'fail', e.message)
  await rep.shot(page, 'fatal')
} finally {
  const r = rep.finish()
  await browser.close()
  process.exit(r.fail > 0 ? 1 : 0)
}
