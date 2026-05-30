import type { EnginePlayer, Tier, TierCounts } from './types'

/** Classifica cada jogador em topo/meio/base por terços de overall. Porte de tierMap(). */
export function tierMap(players: EnginePlayer[]): Record<string, Tier> {
  const sorted = [...players].sort((a, b) => b.overall - a.overall)
  const n = sorted.length
  const cut = Math.max(1, Math.round(n / 3))
  const map: Record<string, Tier> = {}
  sorted.forEach((p, i) => {
    map[p.id] = i < cut ? 'topo' : i >= n - cut ? 'base' : 'meio'
  })
  return map
}

export function tiersOf(team: EnginePlayer[], tm: Record<string, Tier>): TierCounts {
  const counts: TierCounts = { topo: 0, meio: 0, base: 0 }
  for (const p of team) counts[tm[p.id]]++
  return counts
}

/** Regra Desenvolvimento: cada time mistura níveis — >=1 topo E >=1 base (mentor + aprendiz). */
export function isMixed(
  t1: EnginePlayer[],
  t2: EnginePlayer[],
  tm: Record<string, Tier>,
): boolean {
  const a = tiersOf(t1, tm)
  const b = tiersOf(t2, tm)
  return a.topo >= 1 && a.base >= 1 && b.topo >= 1 && b.base >= 1
}
