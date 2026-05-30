// Smoke test de UI real: login → Home → confirma seleção de turma (não placeholder).
import { chromium } from 'playwright-core'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE = process.env.BASE || 'http://localhost:5173'
const EMAIL = 'treinador@gmail.com'
const PASS = 'teste123456'

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message))

const log = (s) => console.log(s)

try {
  // 1. Login
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
  await page.fill('input[type="email"]', EMAIL)
  await page.fill('input[type="password"]', PASS)
  await page.click('button[type="submit"]')
  await page.waitForURL(`${BASE}/`, { timeout: 15000 })
  log('✅ login → redirecionou para Home')

  // 2. Home deve mostrar seleção de turma, NÃO o placeholder
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)
  const body = await page.textContent('body')

  const hasPlaceholder = body.includes('será concluída na Sprint')
  const hasIniciar = body.includes('Iniciar treino') || body.includes('Selecione uma turma')
  const hasTurma = body.includes('Sub-17') || body.includes('Iniciante Misto') || body.includes('Sub-15')

  log(hasPlaceholder ? '❌ Home AINDA mostra placeholder' : '✅ Home SEM placeholder')
  log(hasIniciar ? '✅ Home mostra botão/CTA de iniciar treino' : '❌ Home sem CTA de treino')
  log(hasTurma ? '✅ Home lista turmas reais do banco' : '⚠️ Home sem turmas visíveis')

  await page.screenshot({ path: 'scripts/home-real.png', fullPage: true })
  log('📸 screenshot salvo: scripts/home-real.png')

  // 3. Navega para Alunos e confirma lista real
  await page.click('text=Alunos')
  await page.waitForTimeout(1500)
  const alunosBody = await page.textContent('body')
  const hasAlunoStub = alunosBody.includes('será concluíd') || alunosBody.includes('Em construção')
  const hasAlunoReal = alunosBody.includes('Bruno') || alunosBody.includes('Geral') || alunosBody.includes('Novo')
  log(hasAlunoStub ? '❌ Alunos com stub' : '✅ Alunos sem stub')
  log(hasAlunoReal ? '✅ Alunos renderiza conteúdo real' : '⚠️ Alunos vazio')
  await page.screenshot({ path: 'scripts/alunos-real.png', fullPage: true })

  log('CONSOLE_ERRORS=' + errors.length)
  if (errors.length) errors.slice(0, 8).forEach((e) => log('  ⚠ ' + e))

  const ok = !hasPlaceholder && hasIniciar && !hasAlunoStub
  log(ok ? '\n🟢 SMOKE UI PASSOU' : '\n🔴 SMOKE UI FALHOU')
  process.exit(ok ? 0 : 1)
} catch (e) {
  log('💥 ERRO: ' + e.message)
  await page.screenshot({ path: 'scripts/error.png' }).catch(() => {})
  process.exit(1)
} finally {
  await browser.close()
}
