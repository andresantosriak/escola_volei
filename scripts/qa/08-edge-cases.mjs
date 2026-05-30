// QA módulo 08 — Edge cases: turma <4 alunos, set empatado, W.O. sem vencedor.
import { makeContext, makeReport, login, go, expectText, expectMatch, sleep } from './lib.mjs'
import { readFileSync } from 'node:fs'

const rep = makeReport('08-edge-cases')
const E = Object.fromEntries(
  readFileSync('.env', 'utf8').split('\n').map((l) => {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    return m ? [m[1], m[2].replace(/^["']|["']$/g, '')] : ['', '']
  }),
)
const QID = readFileSync('/tmp/qa_uid.txt', 'utf8').trim()

async function sql(q) {
  await fetch(`https://api.supabase.com/v1/projects/${E.SUPABASE_PROJECT_ID}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${E.SUPABASE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: q }),
  })
}

await sql(`DO $$ DECLARE c UUID:='${QID}'; f UUID; t UUID; sid UUID; i INT;
BEGIN
  DELETE FROM students WHERE coach_id=c AND name LIKE 'Edge %';
  DELETE FROM teams WHERE coach_id=c AND name='Edge QA T';
  DELETE FROM branches WHERE coach_id=c AND name='Edge QA';
  INSERT INTO branches(coach_id,name) VALUES(c,'Edge QA') RETURNING id INTO f;
  INSERT INTO teams(branch_id,coach_id,name) VALUES(f,c,'Edge QA T') RETURNING id INTO t;
  FOR i IN 1..2 LOOP INSERT INTO students(coach_id,name,position) VALUES(c,'Edge '||i,'PON') RETURNING id INTO sid; INSERT INTO team_students(team_id,student_id) VALUES(t,sid); END LOOP;
END $$; SELECT 1;`)

const { browser, page, consoleErrors } = await makeContext()
try {
  await login(page, rep)

  // Edge 1: turma com 2 alunos bloqueia montar times
  await go(page, '/')
  await expectText(page, 'Edge QA T', 6000)
  await page.click('text=Edge QA T')
  await sleep(400)
  await page.locator('button:has-text("Iniciar treino")').click()
  await expectText(page, 'Chamada', 6000)
  const minMsg = await expectMatch(page, /Mínimo de 4 presentes/i, 4000)
  const btn = page.locator('button:has-text("Mínimo de 4"), button:has-text("Montar times")').last()
  const disabled = await btn.isDisabled().catch(() => false)
  rep.step('Turma com 2 alunos: "Montar times" desabilitado + mensagem', minMsg && disabled ? 'pass' : 'fail', `min=${minMsg} disabled=${disabled}`)
  await rep.shot(page, 'min-players')

  // Edge 2: set empatado + W.O. sem vencedor
  await go(page, '/')
  await expectText(page, 'Treino QA T1', 6000)
  await page.click('text=Treino QA T1')
  await sleep(400)
  await page.locator('button:has-text("Iniciar treino")').click()
  await expectText(page, 'Chamada', 6000)
  await page.click('button:has-text("Montar times")')
  await expectText(page, 'Montar times', 6000)
  await sleep(1200)
  await page.click('button:has-text("Registrar resultado")')
  await expectText(page, 'Registrar resultado', 6000)
  await sleep(400)

  await page.click('button:has-text("Salvar e finalizar")')
  const tieBlocked = await expectMatch(page, /empate/i, 4000)
  rep.step('Set empatado bloqueia salvar (exige vencedor)', tieBlocked ? 'pass' : 'fail')
  await rep.shot(page, 'tie-blocked')

  await page.click('button:has-text("W.O.")')
  await sleep(300)
  await page.click('button:has-text("Salvar e finalizar")')
  const woBlocked = await expectMatch(page, /W\.O\. exige|exige selecionar/i, 4000)
  rep.step('W.O. sem vencedor bloqueia salvar', woBlocked ? 'pass' : 'warn', woBlocked ? 'mensagem exibida' : 'verificar')
  await rep.shot(page, 'wo-blocked')

  rep.step('Console limpo no fluxo de edge cases', consoleErrors.length === 0 ? 'pass' : 'warn', `${consoleErrors.length} erro(s)`)
  if (consoleErrors.length) consoleErrors.slice(0, 6).forEach((e) => console.log('   ⚠ ' + e))
} catch (e) {
  rep.step('ERRO FATAL', 'fail', e.message)
  await rep.shot(page, 'fatal')
} finally {
  const r = rep.finish()
  await browser.close()
  process.exit(r.fail > 0 ? 1 : 0)
}
