import type { EnginePlayer, EnginePosition } from './types'

/** Positions used for distribution penalty */
const POSITIONS: EnginePosition[] = ['LEV', 'PON', 'OPO', 'CEN', 'LIB']

export interface BalanceScoreOpts {
  /** Weighted skill keys: key -> weight (0.5..2.0). If omitted, uses union of player keys with weight 1. */
  skillWeights?: Record<string, number>
}

export function teamForce(team: EnginePlayer[]): number {
  return team.reduce((acc, p) => acc + p.overall, 0)
}

/**
 * Resolve which skill keys and weights to use.
 * If opts.skillWeights is provided, use those keys and weights.
 * Otherwise, compute the union of all skill keys present across both teams, weight 1 each.
 * This keeps backward compatibility: old callers without opts get the same behaviour.
 */
function resolveSkillKeys(
  t1: EnginePlayer[],
  t2: EnginePlayer[],
  opts?: BalanceScoreOpts,
): Record<string, number> {
  if (opts?.skillWeights && Object.keys(opts.skillWeights).length > 0) {
    return opts.skillWeights
  }
  // Union of all skill keys across both teams, weight 1
  const keys = new Set<string>()
  for (const p of t1) for (const k of Object.keys(p.skills)) keys.add(k)
  for (const p of t2) for (const k of Object.keys(p.skills)) keys.add(k)
  const result: Record<string, number> = {}
  for (const k of keys) result[k] = 1
  return result
}

function teamSkillSums(team: EnginePlayer[], keys: string[]): Record<string, number> {
  const sums: Record<string, number> = {}
  for (const k of keys) sums[k] = 0
  for (const p of team) {
    for (const k of keys) sums[k] += p.skills[k] ?? 0
  }
  return sums
}

const isSetter = (p: EnginePlayer) => p.position === 'LEV'
const canSetter = (p: EnginePlayer) =>
  p.position === 'LEV' || p.alternatePositions.includes('LEV')

/**
 * Count players per position in a team.
 */
function positionCounts(team: EnginePlayer[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const pos of POSITIONS) counts[pos] = 0
  for (const p of team) {
    if (p.position && counts[p.position] !== undefined) {
      counts[p.position]++
    }
  }
  return counts
}

/**
 * Count guest players in a team.
 */
function guestCount(team: EnginePlayer[]): number {
  return team.filter((p) => p.isGuest).length
}

/**
 * Balance index 20-99. Combines force gap, weighted skill gap,
 * setter penalty, position distribution penalty, and guest distribution penalty.
 *
 * Backward compatible: balanceScore(t1, t2) without opts works exactly as before
 * for the union of player skill keys (all weight 1).
 *
 * New terms (positions, guests) have SECONDARY coefficients so they influence
 * but don't dominate the force/skill terms.
 */
export function balanceScore(
  t1: EnginePlayer[],
  t2: EnginePlayer[],
  opts?: BalanceScoreOpts,
): number {
  const weights = resolveSkillKeys(t1, t2, opts)
  const keys = Object.keys(weights)

  const s1 = teamSkillSums(t1, keys)
  const s2 = teamSkillSums(t2, keys)

  // Weighted skill gap term
  let fundDiff = 0
  let fundMax = 0
  for (const k of keys) {
    const w = weights[k]
    fundDiff += Math.abs(s1[k] - s2[k]) * w
    fundMax += (s1[k] + s2[k] || 1) * w
  }
  const fundTerm = fundDiff / fundMax

  // Force term (overall gap)
  const fTot = teamForce(t1) + teamForce(t2) || 1
  const forceTerm = Math.abs(teamForce(t1) - teamForce(t2)) / fTot

  let score = 100 - fundTerm * 130 - forceTerm * 90

  // Setter penalty (preserved from original)
  const lev1 = t1.some(isSetter)
  const lev2 = t2.some(isSetter)
  if (!lev1 || !lev2) score -= 22
  if (!lev1 && t1.some(canSetter)) score += 10
  if (!lev2 && t2.some(canSetter)) score += 10

  // Position distribution penalty (SECONDARY coefficient)
  // Penalizes when positions are unevenly distributed between teams
  const pos1 = positionCounts(t1)
  const pos2 = positionCounts(t2)
  let posDiff = 0
  for (const pos of POSITIONS) {
    posDiff += Math.abs(pos1[pos] - pos2[pos])
  }
  // Coefficient 3 per position difference — secondary vs 130/90 of main terms
  score -= posDiff * 3

  // Guest distribution penalty (SECONDARY coefficient)
  // Penalizes when guests are unevenly distributed between teams
  const gDiff = Math.abs(guestCount(t1) - guestCount(t2))
  // Coefficient 4 per guest difference — secondary
  score -= gDiff * 4

  return Math.max(20, Math.min(99, Math.round(score)))
}

export { canSetter, isSetter }
