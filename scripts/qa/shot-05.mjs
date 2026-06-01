// Captura só a tela 05 (Registrar resultado), usando o fluxo validado do 04-training.mjs.
import { makeContext, login, go, expectText, sleep } from './lib.mjs'
import { mkdirSync } from 'node:fs'

const OUT = 'scripts/qa/shots/app'
mkdirSync(OUT, { recursive: true })

const { browser, page } = await makeContext({ viewport: { width: 390, height: 844 } })

try {
  await login(page)

  await go(page, '/')
  const hasTeam = await expectText(page, 'Treino QA T1', 8000)
  console.log('home tem turma:', hasTeam)
  await page.click('text=Treino QA T1')
  await sleep(500)
  await page.locator('button:has-text("Iniciar treino")').click()
  console.log('attendance:', await expectText(page, 'Chamada', 8000))
  await sleep(800)

  await page.click('button:has-text("Montar times")')
  console.log('build:', await expectText(page, 'Montar times', 8000))
  await sleep(1400) // engine roda

  await page.click('button:has-text("Registrar resultado")')
  const onResult = await expectText(page, 'Registrar resultado', 8000)
  console.log('result:', onResult, '| url:', page.url())

  await sleep(900) // estabiliza render
  await page.screenshot({ path: `${OUT}/05-registrar-resultado.png` })
  console.log('✅ saved 05-registrar-resultado.png')
} catch (e) {
  console.log('ERRO:', e.message)
  await page.screenshot({ path: `${OUT}/05-registrar-resultado.png` }).catch(() => {})
} finally {
  await browser.close()
}
