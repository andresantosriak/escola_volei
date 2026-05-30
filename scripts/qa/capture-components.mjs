// Captura os componentes corrigidos no app real para comparar com os previews do design system.
import { makeContext, login, go, expectText, expectMatch, sleep } from './lib.mjs'

const { browser, page } = await makeContext()
const OUT = 'scripts/qa/shots/ds-app'
import('node:fs').then((fs) => fs.mkdirSync(OUT, { recursive: true }))

try {
  await login(page)

  // PlayerCard + StatBadge — perfil de um aluno do Treino QA (tem skills)
  await go(page, '/students')
  const stu = page.locator('button:has-text("Treino")').first()
  if (await stu.count()) {
    await stu.click()
    await expectText(page, 'Posição principal', 6000)
    await page.click('text=Desempenho')
    await sleep(900)
    await page.screenshot({ path: `${OUT}/app-playercard.png` })
    console.log('✅ playercard')
  }

  // PresenceToggle — chamada
  await go(page, '/')
  await expectText(page, 'Treino QA T1', 6000)
  await page.click('text=Treino QA T1')
  await sleep(400)
  await page.locator('button:has-text("Iniciar treino")').click()
  await expectText(page, 'Chamada', 6000)
  await sleep(600)
  await page.screenshot({ path: `${OUT}/app-presenca.png` })
  console.log('✅ presenca')

  // BalanceIndicator + Button — montar times
  await page.click('button:has-text("Montar times")')
  await expectText(page, 'Montar times', 6000)
  await sleep(1500)
  await page.screenshot({ path: `${OUT}/app-equilibrio.png` })
  console.log('✅ equilibrio')

  // Scale5 — registrar resultado → avaliação
  await page.click('button:has-text("Registrar resultado")')
  await expectText(page, 'Registrar resultado', 6000)
  await sleep(400)
  await page.screenshot({ path: `${OUT}/app-buttons.png` })
  console.log('✅ buttons (registrar)')

  console.log('\ncapturas em', OUT)
} catch (e) {
  console.log('ERRO:', e.message)
} finally {
  await browser.close()
}
