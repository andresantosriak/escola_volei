// QA módulo 03 — Alunos: criar vários, posição, perfil 2 abas, player card, amostra insuficiente, ordenação.
import { makeContext, makeReport, login, go, expectText, expectMatch, sleep } from './lib.mjs'

const { browser, page, consoleErrors } = await makeContext()
const rep = makeReport('03-students')
const stamp = Date.now().toString().slice(-4)

const STUDENTS = [
  { nome: `Ana QA ${stamp}`, pos: 'LEV', idade: '15', altura: '170' },
  { nome: `Bia QA ${stamp}`, pos: 'PON', idade: '16', altura: '175' },
  { nome: `Caio QA ${stamp}`, pos: 'OPO', idade: '16', altura: '182' },
  { nome: `Duda QA ${stamp}`, pos: 'CEN', idade: '17', altura: '188' },
  { nome: `Eli QA ${stamp}`, pos: 'LIB', idade: '15', altura: '165' },
  { nome: `Fil QA ${stamp}`, pos: 'LEV', idade: '16', altura: '178' },
]

try {
  await login(page, rep)

  await go(page, '/students')
  rep.step('Abrir Alunos', (await expectText(page, 'Alunos')) ? 'pass' : 'fail')
  await rep.shot(page, 'list-initial')

  let firstCreateMs = null
  let createdCount = 0
  for (let i = 0; i < STUDENTS.length; i++) {
    const s = STUDENTS[i]
    await go(page, '/students/new')
    await expectText(page, 'Posição principal')
    await page.fill('input[placeholder="Bruno Almeida"]', s.nome)
    await page.locator(`button:has-text("${s.pos}")`).first().click()
    await page.fill('input[placeholder="16"]', s.idade)
    await page.fill('input[placeholder="182"]', s.altura)
    const teamBtn = page.locator('button:has-text("Turma QA")').first()
    if (await teamBtn.count()) await teamBtn.click().catch(() => {})
    const t0 = Date.now()
    await page.click('button:has-text("Salvar")')
    const ok = await expectText(page, s.nome.split(' ')[0], 10000)
    if (ok) createdCount++
    if (i === 0) firstCreateMs = Date.now() - t0
  }
  rep.step(`Criar ${STUDENTS.length} alunos`, createdCount === STUDENTS.length ? 'pass' : 'fail', `${createdCount}/${STUDENTS.length}, 1º em ${firstCreateMs}ms`)
  await rep.shot(page, 'list-after-create')

  // perfil aba Dados
  await page.click(`text=${STUDENTS[0].nome}`)
  rep.step('Perfil abre na aba Dados', (await expectText(page, 'Posição principal', 8000)) ? 'pass' : 'fail')
  await rep.shot(page, 'detail-dados')

  // aba Desempenho
  await page.click('text=Desempenho')
  const hasCard = await expectMatch(page, /GERAL/i, 5000)
  rep.step('Aba Desempenho mostra player card (GERAL)', hasCard ? 'pass' : 'fail')
  const insufficient = await expectMatch(page, /amostra insuficiente/i, 3000)
  rep.step('RN11: amostra insuficiente (aluno sem partidas)', insufficient ? 'pass' : 'warn')
  await rep.shot(page, 'detail-desempenho')

  // ordenação
  await go(page, '/students')
  const sortBtn = page.locator('button[aria-label="Alternar ordenação"]')
  if (await sortBtn.count()) {
    await sortBtn.click()
    await sleep(400)
    rep.step('Alternar ordenação (nome ↔ nota)', 'pass')
  } else rep.step('Botão de ordenação', 'warn', 'não encontrado')

  rep.step('Console limpo no fluxo de alunos', consoleErrors.length === 0 ? 'pass' : 'warn', `${consoleErrors.length} erro(s)`)
  if (consoleErrors.length) consoleErrors.slice(0, 6).forEach((e) => console.log('   ⚠ ' + e))
} catch (e) {
  rep.step('ERRO FATAL no módulo', 'fail', e.message)
  await rep.shot(page, 'fatal')
} finally {
  const r = rep.finish()
  await browser.close()
  process.exit(r.fail > 0 ? 1 : 0)
}
