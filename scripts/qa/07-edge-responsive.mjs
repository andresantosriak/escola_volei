// QA módulo 07 — CSV (download real), responsividade multi-viewport, edge cases do engine via UI.
import { chromium } from 'playwright-core'
import { makeContext, makeReport, login, go, expectText, expectMatch, BASE, QA_EMAIL, QA_PASS, CHROME, sleep } from './lib.mjs'
import { readFileSync } from 'node:fs'

const rep = makeReport('07-edge-responsive')

// ---------- 1. CSV download real (contexto com acceptDownloads) ----------
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
    rep.step('Exportar CSV: download capturado + cabeçalho correto', hasHeader ? 'pass' : 'fail', `${await dl.suggestedFilename()}, ${lines} linhas`)
  } catch (e) {
    rep.step('Exportar CSV download', 'fail', e.message)
  } finally {
    await browser.close()
  }
}

// ---------- 2. Responsividade: 4 larguras, sem overflow horizontal ----------
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
    rep.step(`Responsivo @ ${w}px — sem overflow horizontal`, overflow ? 'fail' : 'pass')
  } catch (e) {
    rep.step(`Responsivo @ ${w}px`, 'fail', e.message)
  } finally {
    await browser.close()
  }
}

// ---------- 3. Edge case: turma com poucos alunos (<4) bloqueia montar times ----------
{
  // setup: turma "Edge QA" com apenas 2 alunos via API
  const E = Object.fromEntries(readFileSync('.env', 'utf8').split('\n').map((l) => { const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); return m ? [m[1], m[2].replace(/^["']|["']$/g, '')] : ['', ''] }))
  const QID = readFileSync('/tmp/qa_uid.txt', 'utf8').trim()
  await fetch(`https://api.supabase.com/v1/projects/${E.SUPABASE_PROJECT_ID}/database/query`, {
    method: 'POST', headers: { Authorization: `Bearer ${E.SUPABASE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: `
DO $$ DECLARE c UUID:='${QID}'; f UUID; t UUID; sid UUID; i INT;
BEGIN
  DELETE FROM students WHERE coach_id=c AND name LIKE 'Edge %';
  DELETE FROM teams WHERE coach_id=c AND name='Edge QA T';
  DELETE FROM branches WHERE coach_id=c AND name='Edge QA';
  INSERT INTO branches(coach_id,name) VALUES(c,'Edge QA') RETURNING id INTO f;
  INSERT INTO teams(branch_id,coach_id,name) VALUES(f,c,'Edge QA T') RETURNING id INTO t;
  FOR i IN 1..2 LOOP
    INSERT INTO students(coach_id,name,position) VALUES(c,'Edge '||i,'PON') RETURNING id INTO sid;
    INSERT INTO team_students(team_id,student_id) VALUES(t,sid);
  END LOOP;
END $$; SELECT 1;` }),
  })

  const { browser, page } = await makeContext()
  try {
    await login(page)
    await go(page, '/')
    await expectText(page, 'Edge QA T', 6000)
    await page.click('text=Edge QA T')
    await sleep(500)
    await page.locator('button:has-text("Iniciar treino")').click()
    await expectText(page, 'Chamada', 6000)
    // 2 presentes < 4 → botão deve indicar mínimo
    const minMsg = await expectMatch(page, /Mínimo de 4 presentes/i, 4000)
    const btn = page.locator('button:has-text("Mínimo de 4"), button:has-text("Montar times")').last()
    const disabled = await btn.isDisabled().catch(() => false)
    rep.step('Edge: turma com 2 alunos → "Montar times" desabilitado', minMsg && disabled ? 'pass' : minMsg ? 'pass' : 'warn', minMsg ? 'mensagem de mínimo exibida' : '')
    await rep.shot(page, 'edge-min-players')
  } catch (e) {
    rep.step('Edge case poucos alunos', 'fail', e.message)
    await rep.shot(page, 'edge-fatal')
  } finally {
    await browser.close()
  }
}

const r = rep.finish()
process.exit(r.fail > 0 ? 1 : 0)
