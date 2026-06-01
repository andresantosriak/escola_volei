// Captura 16-filial-detalhe (detalhe da filial). Loga, abre lista de filiais, entra na primeira.
import { makeContext, login, go, sleep } from './lib.mjs'
import { mkdirSync } from 'node:fs'

const OUT = 'scripts/qa/shots/app'
mkdirSync(OUT, { recursive: true })

const { browser, page } = await makeContext({ viewport: { width: 390, height: 844 } })
try {
  await login(page)
  await go(page, '/manage/branches')
  await sleep(1400)
  // Dump dos elementos clicaveis dentro do main p/ achar a row da filial
  const els = await page.evaluate(() => {
    const out = []
    document.querySelectorAll('main button, main a, main [role="button"]').forEach((e, i) => {
      out.push({ i, tag: e.tagName, text: (e.textContent || '').trim().slice(0, 40) })
    })
    return out
  })
  console.log('Clickables:', JSON.stringify(els, null, 1))

  // Clica na primeira row que tem texto de filial (evita o botao de adicionar do header).
  // ListRow costuma ter subtitle; pega a primeira que NAO seja "Nova"/"Adicionar"/vazia.
  const target = els.find((e) => e.text && !/nova|adicion|\+/i.test(e.text))
  if (target) {
    await page.locator('main button, main a, main [role="button"]').nth(target.i).click({ timeout: 5000 })
  }
  await sleep(1500)
  console.log('URL:', page.url())
  await page.screenshot({ path: `${OUT}/16-filial-detalhe.png` })
  console.log('✅ 16-filial-detalhe')
} catch (e) {
  console.log('ERRO:', e.message)
} finally {
  await browser.close()
}
