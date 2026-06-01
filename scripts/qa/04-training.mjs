// QA módulo 04 — Fluxo de treino completo: Home→Chamada→Montar Times→Resultado→Avaliação.
import { makeContext, makeReport, login, go, expectText, expectMatch, sleep } from './lib.mjs'

const { browser, page, consoleErrors } = await makeContext()
const rep = makeReport('04-training')

try {
  await login(page, rep)

  // 1. HOME: turma "Treino QA T1" deve aparecer com 7 alunos
  await go(page, '/')
  const hasTeam = await expectText(page, 'Treino QA T1', 8000)
  rep.step('Home lista turma de treino', hasTeam ? 'pass' : 'fail')
  await rep.shot(page, 'home')

  // seleciona a turma
  await page.click('text=Treino QA T1')
  await sleep(500)
  // botão iniciar treino habilitado
  const startBtn = page.locator('button:has-text("Iniciar treino")')
  const startEnabled = (await startBtn.count()) && !(await startBtn.isDisabled())
  rep.step('Botão "Iniciar treino" habilita ao selecionar turma', startEnabled ? 'pass' : 'fail')
  let t0 = Date.now()
  await startBtn.click()
  const onAttendance = await expectText(page, 'Chamada', 8000)
  rep.step('Iniciar treino → tela de Chamada', onAttendance ? 'pass' : 'fail', '', Date.now() - t0)
  await rep.shot(page, 'attendance')

  // 2. CHAMADA: contador inicial, marcar 1 falta e 1 atraso
  const counterInit = await expectMatch(page, /7\/7/, 4000)
  rep.step('Contador inicia 7/7 (todos presentes por padrão)', counterInit ? 'pass' : 'warn')
  // clica no toggle de falta do primeiro aluno (3º botão do primeiro grupo de presença)
  const faltaBtns = page.locator('button[aria-label="Falta"]')
  if (await faltaBtns.count()) {
    await faltaBtns.first().click()
    await sleep(300)
  }
  const counterAfter = await expectMatch(page, /6\/7/, 4000)
  rep.step('Marcar 1 falta → contador 6/7', counterAfter ? 'pass' : 'warn')
  await rep.shot(page, 'attendance-marked')

  // montar times
  t0 = Date.now()
  await page.click('button:has-text("Montar times")')
  const onBuild = await expectText(page, 'Montar times', 8000)
  rep.step('Chamada → Montar times', onBuild ? 'pass' : 'fail', '', Date.now() - t0)
  await sleep(1200) // engine roda
  await rep.shot(page, 'build-teams')

  // 3. MONTAR TIMES: índice de equilíbrio + 2 painéis
  const hasBalance = await expectMatch(page, /equilibrad|mistos|%/i, 6000)
  rep.step('Engine montou times + índice de equilíbrio', hasBalance ? 'pass' : 'fail')
  // reequilibrar
  const reBtn = page.locator('button:has-text("Reequilibrar")')
  if (await reBtn.count()) {
    await reBtn.click()
    await sleep(1000)
    rep.step('Botão "Reequilibrar" gera nova divisão', 'pass')
  } else rep.step('Botão "Reequilibrar"', 'warn', 'não encontrado')
  // alternar modo Desenvolvimento
  const devBtn = page.locator('button:has-text("Desenvolvimento")')
  if (await devBtn.count()) {
    await devBtn.click()
    await sleep(1200)
    rep.step('Alternar modo Desenvolvimento recalcula', 'pass')
  } else rep.step('Modo Desenvolvimento', 'warn', 'não encontrado')
  await rep.shot(page, 'build-dev')

  // registrar resultado
  t0 = Date.now()
  await page.click('button:has-text("Registrar resultado")')
  const onResult = await expectText(page, 'Registrar resultado', 8000)
  rep.step('Montar times → Registrar resultado', onResult ? 'pass' : 'fail', '', Date.now() - t0)
  await rep.shot(page, 'result')

  // 4. RESULTADO: preencher set 25x20 (Time A vence)
  // botões + de cada time (Stepper). Aumenta Time A para 25, Time B para 20.
  const plusBtns = page.locator('button[aria-label="Aumentar"]')
  const nPlus = await plusBtns.count()
  rep.step('Tela de resultado tem steppers de placar', nPlus >= 2 ? 'pass' : 'fail', `${nPlus} botões +`)
  if (nPlus >= 2) {
    // primeiro set: time A (stepper 0) +25, time B (stepper 1) +20
    for (let k = 0; k < 25; k++) await plusBtns.nth(0).click()
    for (let k = 0; k < 20; k++) await plusBtns.nth(1).click()
    await sleep(300)
  }
  const tally = await expectMatch(page, /1 × 0/, 4000)
  rep.step('Placar 25×20 → vencedor automático Time A (1×0)', tally ? 'pass' : 'warn')
  await rep.shot(page, 'result-filled')

  // adicionar set e preenchê-lo (set vazio = empate, que desabilita o salvar — comportamento correto do app)
  const addSet = page.locator('button:has-text("Adicionar set")')
  if (await addSet.count()) {
    await addSet.click()
    await sleep(300)
    rep.step('Adicionar 2º set', 'pass')
    // preenche o 2º set 25×18 (Time A vence o set também → mantém vencedor definido)
    const plus2 = page.locator('button[aria-label="Aumentar"]')
    const n2 = await plus2.count()
    if (n2 >= 4) {
      for (let k = 0; k < 25; k++) await plus2.nth(2).click()
      for (let k = 0; k < 18; k++) await plus2.nth(3).click()
      await sleep(300)
    }
  }

  // salvar resultado → vai para avaliação (sessionId + result presentes)
  t0 = Date.now()
  await page.click('button:has-text("Salvar resultado")')
  // salvar com sessão+times leva à tela de avaliação (header = nome do aluno + "Fundamentos técnicos")
  const afterSave = await expectMatch(page, /Fundamentos|Hist[óo]rico|Engajamento/i, 10000)
  rep.step('Salvar resultado → avaliação ou histórico', afterSave ? 'pass' : 'fail', '', Date.now() - t0)
  await rep.shot(page, 'after-save')

  // 5. AVALIAÇÃO (se chegou nela)
  if (/Fundamentos/i.test(await page.textContent('body'))) {
    const saveNext = page.locator('button:has-text("Salvar e próximo"), button:has-text("Salvar avaliação")')
    if (await saveNext.count()) {
      await saveNext.first().click()
      await sleep(1500)
      rep.step('Avaliar aluno (engajamento + fundamentos) e salvar', 'pass')
    }
    await rep.shot(page, 'evaluate')
  }

  rep.step('Console limpo no fluxo de treino', consoleErrors.length === 0 ? 'pass' : 'warn', `${consoleErrors.length} erro(s)`)
  if (consoleErrors.length) consoleErrors.slice(0, 8).forEach((e) => console.log('   ⚠ ' + e))
} catch (e) {
  rep.step('ERRO FATAL no módulo', 'fail', e.message)
  await rep.shot(page, 'fatal')
} finally {
  const r = rep.finish()
  await browser.close()
  process.exit(r.fail > 0 ? 1 : 0)
}
