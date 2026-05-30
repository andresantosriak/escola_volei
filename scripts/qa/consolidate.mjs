import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
const dir = 'scripts/qa/shots'
const files = readdirSync(dir).filter((f) => f.endsWith('-report.json') && f !== 'report.json').sort()
let P = 0, W = 0, F = 0
const rows = []
for (const f of files) {
  const j = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8'))
  P += j.pass; W += j.warn; F += j.fail
  rows.push(j)
}
console.log('MÓDULO'.padEnd(26), 'PASS', 'WARN', 'FAIL')
for (const r of rows) console.log(r.module.padEnd(26), String(r.pass).padStart(4), String(r.warn).padStart(4), String(r.fail).padStart(4))
console.log('─'.repeat(46))
console.log('TOTAL'.padEnd(26), String(P).padStart(4), String(W).padStart(4), String(F).padStart(4))
writeFileSync('/tmp/qa_rows.json', JSON.stringify(rows))
