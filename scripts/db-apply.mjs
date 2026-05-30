#!/usr/bin/env node
// Aplica um arquivo .sql no Supabase remoto via Management API (database/query).
// Uso: node scripts/db-apply.mjs supabase/migrations/0001_initial_schema.sql
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnv() {
  const env = {}
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env'), 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch {}
  return env
}

const env = loadEnv()
const PROJECT_ID = env.SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_ID
const TOKEN = env.SUPABASE_ACCESS_TOKEN || process.env.SUPABASE_ACCESS_TOKEN

const file = process.argv[2]
if (!file) {
  console.error('Uso: node scripts/db-apply.mjs <arquivo.sql>')
  process.exit(1)
}
if (!PROJECT_ID || !TOKEN) {
  console.error('SUPABASE_PROJECT_ID ou SUPABASE_ACCESS_TOKEN ausentes no .env')
  process.exit(1)
}

const sql = readFileSync(resolve(process.cwd(), file), 'utf8')

const res = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  },
)

const text = await res.text()
if (!res.ok) {
  console.error(`❌ HTTP ${res.status} aplicando ${file}`)
  console.error(text)
  process.exit(1)
}
console.log(`✅ Aplicado: ${file}`)
console.log(text.slice(0, Number(process.env.DBA_MAX || 400)))
