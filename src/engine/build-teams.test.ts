import { describe, it, expect } from 'vitest'
import { buildTeams } from './build-teams'
import { balanceScore } from './balance-score'
import type { EnginePlayer } from './types'

function mkPlayer(id: string, overall: number, position: EnginePlayer['position'], skills?: Partial<Record<string, number>>): EnginePlayer {
  const base = { saque: 3, recepcao: 3, levantamento: 3, ataque: 3, bloqueio: 3, defesa: 3 }
  return {
    id,
    name: `Jogador ${id}`,
    position,
    alternatePositions: [],
    overall,
    skills: { ...base, ...skills },
  }
}

const roster = (n: number): EnginePlayer[] =>
  Array.from({ length: n }, (_, i) =>
    mkPlayer(`p${i}`, 50 + ((i * 7) % 45), i % 4 === 0 ? 'LEV' : 'PON'),
  )

describe('buildTeams', () => {
  it('monta 2 times iguais com número par de jogadores', () => {
    const r = buildTeams(roster(12), { mode: 'competitive', size: 6, seed: 1 })
    expect(r.teamA.length).toBe(6)
    expect(r.teamB.length).toBe(6)
    expect(r.bench.length).toBe(0)
  })

  it('manda sobra (ímpar) para o banco', () => {
    const r = buildTeams(roster(5), { mode: 'competitive', size: 6, seed: 1 })
    expect(r.teamA.length).toBe(2)
    expect(r.teamB.length).toBe(2)
    expect(r.bench.length).toBe(1)
  })

  it('respeita o tamanho do time (6x6 com 14 → 6+6, 2 no banco)', () => {
    const r = buildTeams(roster(14), { mode: 'competitive', size: 6, seed: 2 })
    expect(r.teamA.length).toBe(6)
    expect(r.teamB.length).toBe(6)
    expect(r.bench.length).toBe(2)
  })

  it('é determinística com a mesma seed', () => {
    const a = buildTeams(roster(12), { mode: 'competitive', size: 6, seed: 42 })
    const b = buildTeams(roster(12), { mode: 'competitive', size: 6, seed: 42 })
    expect(a.teamA.map((p) => p.id)).toEqual(b.teamA.map((p) => p.id))
  })

  it('score fica no intervalo 20-99', () => {
    const r = buildTeams(roster(12), { mode: 'competitive', size: 6, seed: 7 })
    expect(r.score).toBeGreaterThanOrEqual(20)
    expect(r.score).toBeLessThanOrEqual(99)
  })

  it('modo desenvolvimento mistura níveis quando possível', () => {
    const players = [
      mkPlayer('a', 95, 'LEV'),
      mkPlayer('b', 90, 'PON'),
      mkPlayer('c', 85, 'CEN'),
      mkPlayer('d', 55, 'LEV'),
      mkPlayer('e', 52, 'PON'),
      mkPlayer('f', 50, 'CEN'),
    ]
    const r = buildTeams(players, { mode: 'development', size: 3, seed: 3 })
    expect(r.mixed).toBe(true)
  })

  it('funciona com o mínimo de 4 jogadores', () => {
    const r = buildTeams(roster(4), { mode: 'competitive', size: 6, seed: 1 })
    expect(r.teamA.length).toBe(2)
    expect(r.teamB.length).toBe(2)
  })

  it('executa rápido com 14 jogadores (<500ms)', () => {
    const t0 = performance.now()
    buildTeams(roster(14), { mode: 'competitive', size: 6, seed: 9 })
    expect(performance.now() - t0).toBeLessThan(500)
  })
})

describe('balanceScore', () => {
  it('dá score alto para times espelhados', () => {
    const t1 = [mkPlayer('a', 70, 'LEV'), mkPlayer('b', 60, 'PON')]
    const t2 = [mkPlayer('c', 70, 'LEV'), mkPlayer('d', 60, 'PON')]
    expect(balanceScore(t1, t2)).toBeGreaterThan(85)
  })

  it('penaliza time sem levantador', () => {
    const comLev1 = [mkPlayer('a', 70, 'LEV')]
    const comLev2 = [mkPlayer('b', 70, 'LEV')]
    const semLev2 = [mkPlayer('b', 70, 'PON')]
    expect(balanceScore(comLev1, comLev2)).toBeGreaterThan(balanceScore(comLev1, semLev2))
  })
})
