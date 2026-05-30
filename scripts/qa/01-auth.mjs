// QA módulo 01 — Autenticação: login, validação, rotas protegidas, logout, recuperação.
import { makeContext, makeReport, BASE, QA_EMAIL, QA_PASS, sleep } from './lib.mjs'

const { browser, page, consoleErrors } = await makeContext()
const rep = makeReport('01-auth')

try {
  // 1. Rota protegida sem login → redireciona para /login
  let t0 = Date.now()
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
  await page.waitForURL(/\/login/, { timeout: 10000 })
  rep.step('Rota protegida (/) sem sessão redireciona p/ login', 'pass', '', Date.now() - t0)

  // 2. Tela de login renderiza campos
  await page.waitForSelector('input[type="email"]')
  const hasEmail = await page.locator('input[type="email"]').count()
  const hasPass = await page.locator('input[type="password"]').count()
  rep.step('Login mostra campos e-mail + senha', hasEmail && hasPass ? 'pass' : 'fail', `email=${hasEmail} senha=${hasPass}`)
  await rep.shot(page, 'login')

  // 3. Validação Zod: submeter vazio
  await page.click('button[type="submit"]')
  await sleep(400)
  const bodyEmpty = await page.textContent('body')
  const hasValidation = /informe/i.test(bodyEmpty)
  rep.step('Validação de campos vazios (Zod)', hasValidation ? 'pass' : 'warn', hasValidation ? 'mensagens exibidas' : 'sem mensagem visível')

  // 4. Credencial errada → mensagem genérica (SEC: não revela se email existe)
  await page.fill('input[type="email"]', QA_EMAIL)
  await page.fill('input[type="password"]', 'senhaerrada999')
  t0 = Date.now()
  await page.click('button[type="submit"]')
  await sleep(2500)
  const bodyWrong = await page.textContent('body')
  const genericMsg = /incorret|errad|inválid/i.test(bodyWrong)
  rep.step('Login com senha errada → erro amigável', genericMsg ? 'pass' : 'warn', genericMsg ? 'toast de erro' : 'verificar', Date.now() - t0)

  // 5. Link "Criar conta" navega para registro
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' })
  await page.click('text=Criar conta')
  await page.waitForURL(/\/register/, { timeout: 8000 })
  rep.step('Link "Criar conta" → /register', 'pass')
  await rep.shot(page, 'register')

  // 6. Link "Esqueci a senha"
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' })
  await page.click('text=Esqueci a senha')
  await page.waitForURL(/\/forgot-password/, { timeout: 8000 })
  rep.step('Link "Esqueci a senha" → /forgot-password', 'pass')
  await rep.shot(page, 'forgot')

  // 7. Login correto → Home
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' })
  await page.fill('input[type="email"]', QA_EMAIL)
  await page.fill('input[type="password"]', QA_PASS)
  t0 = Date.now()
  await page.click('button[type="submit"]')
  await page.waitForURL(`${BASE}/`, { timeout: 15000 })
  await page.waitForLoadState('networkidle')
  rep.step('Login correto → Home', 'pass', '', Date.now() - t0)

  // 8. Sessão persiste após reload
  await page.reload({ waitUntil: 'networkidle' })
  const stillHome = page.url() === `${BASE}/` || page.url() === `${BASE}`
  rep.step('Sessão persiste após reload (não volta p/ login)', stillHome ? 'pass' : 'fail', page.url())

  // 9. Logout pelo Menu
  await page.click('text=Menu')
  await page.waitForLoadState('networkidle')
  await page.click('text=Sair')
  await page.waitForURL(/\/login/, { timeout: 10000 })
  rep.step('Logout → volta p/ login', 'pass')

  rep.step('Console limpo no fluxo de auth', consoleErrors.length === 0 ? 'pass' : 'warn', `${consoleErrors.length} erro(s)`)
  if (consoleErrors.length) consoleErrors.slice(0, 5).forEach((e) => console.log('   ⚠ ' + e))
} catch (e) {
  rep.step('ERRO FATAL no módulo', 'fail', e.message)
  await rep.shot(page, 'fatal')
} finally {
  const r = rep.finish()
  await browser.close()
  process.exit(r.fail > 0 ? 1 : 0)
}
