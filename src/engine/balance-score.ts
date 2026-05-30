import type { EnginePlayer } from './types'

const FUND_KEYS = ['saque', 'recepcao', 'levantamento', 'ataque', 'bloqueio', 'defesa'] as const

export function teamForce(team: EnginePlayer[]): number {
  return team.reduce((acc, p) => acc + p.overall, 0)
}

function teamSkillSums(team: EnginePlayer[]): Record<string, number> {
  const sums: Record<string, number> = {}
  for (const k of FUND_KEYS) sums[k] = 0
  for (const p of team) {
    for (const k of FUND_KEYS) sums[k] += p.skills[k] ?? 0
  }
  return sums
}

const isSetter = (p: EnginePlayer) => p.position === 'LEV'
const canSetter = (p: EnginePlayer) =>
  p.position === 'LEV' || p.alternatePositions.includes('LEV')

/**
 * Índice de equilíbrio 20-99. Combina o gap de força total com o gap por fundamento
 * (por isso um empate quase perfeito lê ~93%, não 99%). Penaliza times sem levantador.
 * Porte fiel de balanceScore() do protótipo (data.js).
 */
export function balanceScore(t1: EnginePlayer[], t2: EnginePlayer[]): number {
  const s1 = teamSkillSums(t1)
  const s2 = teamSkillSums(t2)
  let fundDiff = 0
  let fundMax = 0
  for (const k of FUND_KEYS) {
    fundDiff += Math.abs(s1[k] - s2[k])
    fundMax += s1[k] + s2[k] || 1
  }
  const fundTerm = fundDiff / fundMax
  const fTot = teamForce(t1) + teamForce(t2) || 1
  const forceTerm = Math.abs(teamForce(t1) - teamForce(t2)) / fTot

  let score = 100 - fundTerm * 130 - forceTerm * 90

  const lev1 = t1.some(isSetter)
  const lev2 = t2.some(isSetter)
  if (!lev1 || !lev2) score -= 22
  if (!lev1 && t1.some(canSetter)) score += 10
  if (!lev2 && t2.some(canSetter)) score += 10

  return Math.max(20, Math.min(99, Math.round(score)))
}

export { canSetter, isSetter, FUND_KEYS }
