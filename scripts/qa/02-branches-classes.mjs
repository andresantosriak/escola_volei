// QA módulo 02 — Filiais + Turmas: criar, validar, editar, roster, lock de exclusão.
// Asserts usam o toast de sucesso (sinal imediato e confiável) + confirmação na lista.
import { makeContext, makeReport, login, go, expectText, expectMatch, sleep } from './lib.mjs'

const { browser, page, consoleErrors } = await makeContext()
const rep = makeReport('02-branches-classes')
const stamp = Date.now().toString().slice(-5)
const branchName = `Filial QA ${stamp}`
const className = `Turma QA ${stamp}`

try {
  await login(page, rep)

  // --- FILIAIS ---
  await go(page, '/manage/branches')
  rep.step('Abrir Filiais', (await expectText(page, 'Filiais')) ? 'pass' : 'fail')
  await rep.shot(page, 'branches-list')

  let t0 = Date.now()
  await go(page, '/manage/branches/new')
  rep.step('Form de nova filial abre', (await expectText(page, 'Nome')) ? 'pass' : 'fail', '', Date.now() - t0)

  // validação: salvar sem nome
  await page.click('button:has-text("Salvar")')
  rep.step('Validação: filial sem nome bloqueia', (await expectMatch(page, /informe o nome/i, 3000)) ? 'pass' : 'fail')

  // preencher tudo
  await page.fill('input[placeholder="Unidade Centro"]', branchName)
  await page.fill('input[placeholder="São Paulo · Centro"]', 'Cidade QA')
  await page.fill('input[placeholder="Rua das Quadras, 120"]', 'Rua QA, 100')
  await page.fill('input[placeholder="(11) 3344-1200"]', '(11) 99999-0000')
  await page.fill('input[placeholder="Téc. Marcos Lima"]', 'Resp. QA')
  t0 = Date.now()
  await page.click('button:has-text("Salvar")')
  const created = await expectMatch(page, /Filial criada/i, 8000) // toast = sinal confiável
  rep.step('Criar filial (POST + toast de sucesso)', created ? 'pass' : 'fail', branchName, Date.now() - t0)
  await expectText(page, branchName, 10000) // espera a lista refetch antes de seguir
  await rep.shot(page, 'branches-after-create')

  // detalhe (InfoRow)
  await page.click(`text=${branchName}`)
  rep.step('Detalhe da filial mostra dados (InfoRow)', (await expectText(page, 'Cidade QA', 8000)) ? 'pass' : 'fail')
  await rep.shot(page, 'branch-detail')

  // editar
  await page.click('button:has-text("Editar")')
  await sleep(400)
  await page.fill('input[placeholder="São Paulo · Centro"]', 'Cidade QA Editada')
  await page.click('button:has-text("Salvar")')
  rep.step('Editar filial e salvar', (await expectMatch(page, /Filial atualizada/i, 8000)) ? 'pass' : 'fail')

  // --- TURMAS ---
  await go(page, '/manage/classes')
  rep.step('Abrir Turmas', (await expectText(page, 'Turmas')) ? 'pass' : 'fail')

  await go(page, '/manage/classes/new')
  await expectText(page, 'Nome')
  await page.fill('input[placeholder="Sub-17 Masculino"]', className)
  const branchSelect = page.locator('select').first()
  await branchSelect.selectOption({ label: branchName }).catch(() => branchSelect.selectOption({ index: 1 }))
  await page.fill('input[placeholder="Seg · Qua · Sex"]', 'Ter · Qui')
  await page.fill('input[placeholder="15–17 anos"]', '14-16 anos')
  await page.fill('input[placeholder="Téc. Marcos"]', 'Prof QA')
  t0 = Date.now()
  await page.click('button:has-text("Salvar")')
  const classCreated = await expectMatch(page, /Turma criada/i, 8000)
  rep.step('Criar turma vinculada à filial (POST + toast)', classCreated ? 'pass' : 'fail', className, Date.now() - t0)
  await expectText(page, className, 10000)
  await rep.shot(page, 'classes-after-create')

  // detalhe da turma (roster)
  await page.click(`text=${className}`)
  rep.step('Detalhe da turma mostra seção de alunos', (await expectMatch(page, /Alunos \(/, 8000)) ? 'pass' : 'fail')
  await rep.shot(page, 'class-detail')

  // --- LOCK RN06 ---
  await go(page, '/manage/branches')
  await page.click(`text=${branchName}`)
  await expectText(page, 'Excluir')
  await page.click('button:has-text("Excluir")')
  await sleep(600)
  await page.locator('button:has-text("Excluir")').last().click()
  rep.step('RN06: excluir filial com turma ativa é bloqueado', (await expectMatch(page, /turma.*ativ/i, 5000)) ? 'pass' : 'fail')
  await rep.shot(page, 'branch-delete-locked')

  rep.step('Console limpo no fluxo de gestão', consoleErrors.length === 0 ? 'pass' : 'warn', `${consoleErrors.length} erro(s)`)
  if (consoleErrors.length) consoleErrors.slice(0, 6).forEach((e) => console.log('   ⚠ ' + e))
} catch (e) {
  rep.step('ERRO FATAL no módulo', 'fail', e.message)
  await rep.shot(page, 'fatal')
} finally {
  const r = rep.finish()
  await browser.close()
  process.exit(r.fail > 0 ? 1 : 0)
}
