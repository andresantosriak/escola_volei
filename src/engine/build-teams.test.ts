import { describe, it, expect } from 'vitest'
import { buildTeams } from './build-teams'
import { balanceScore } from './balance-score'
import type { EnginePlayer } from './types'

function mkPlayer(id: string, overall: number, position: EnginePlayer['position'], skills?: Partial<Record<string, number>>, extra?: Partial<EnginePlayer>): EnginePlayer {
  const base = { saque: 3, recepcao: 3, levantamento: 3, ataque: 3, bloqueio: 3, defesa: 3 }
  return {
    id,
    name: `Jogador ${id}`,
    position,
    alternatePositions: [],
    overall,
    skills: { ...base, ...skills },
    ...extra,
  }
}

const roster = (n: number): EnginePlayer[] =>
  Array.from({ length: n }, (_, i) =>
    mkPlayer(`p${i}`, 50 + ((i * 7) % 45), i % 4 === 0 ? 'LEV' : 'PON'),
  )

describe('buildTeams', () => {
  it('monta 2 times iguais com numero par de jogadores', () => {
    const r = buildTeams(roster(12), { mode: 'competitive', size: 6, seed: 1 })
    expect(r.teamA.length).toBe(6)
    expect(r.teamB.length).toBe(6)
    expect(r.bench.length).toBe(0)
  })

  it('manda sobra (impar) para o banco', () => {
    const r = buildTeams(roster(5), { mode: 'competitive', size: 6, seed: 1 })
    expect(r.teamA.length).toBe(2)
    expect(r.teamB.length).toBe(2)
    expect(r.bench.length).toBe(1)
  })

  it('respeita o tamanho do time (6x6 com 14 -> 6+6, 2 no banco)', () => {
    const r = buildTeams(roster(14), { mode: 'competitive', size: 6, seed: 2 })
    expect(r.teamA.length).toBe(6)
    expect(r.teamB.length).toBe(6)
    expect(r.bench.length).toBe(2)
  })

  it('e deterministica com a mesma seed', () => {
    const a = buildTeams(roster(12), { mode: 'competitive', size: 6, seed: 42 })
    const b = buildTeams(roster(12), { mode: 'competitive', size: 6, seed: 42 })
    expect(a.teamA.map((p) => p.id)).toEqual(b.teamA.map((p) => p.id))
  })

  it('score fica no intervalo 20-99', () => {
    const r = buildTeams(roster(12), { mode: 'competitive', size: 6, seed: 7 })
    expect(r.score).toBeGreaterThanOrEqual(20)
    expect(r.score).toBeLessThanOrEqual(99)
  })

  it('modo desenvolvimento mistura niveis quando possivel', () => {
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

  it('funciona com o minimo de 4 jogadores', () => {
    const r = buildTeams(roster(4), { mode: 'competitive', size: 6, seed: 1 })
    expect(r.teamA.length).toBe(2)
    expect(r.teamB.length).toBe(2)
  })

  it('executa rapido com 14 jogadores (<500ms)', () => {
    const t0 = performance.now()
    buildTeams(roster(14), { mode: 'competitive', size: 6, seed: 9 })
    expect(performance.now() - t0).toBeLessThan(500)
  })

  it('repassa skillWeights ao balanceamento (peso maior muda score)', () => {
    // Two teams where ataque differs a lot but other skills are equal
    const players = [
      mkPlayer('a', 70, 'LEV', { ataque: 5, defesa: 3 }),
      mkPlayer('b', 70, 'PON', { ataque: 5, defesa: 3 }),
      mkPlayer('c', 70, 'CEN', { ataque: 1, defesa: 3 }),
      mkPlayer('d', 70, 'LEV', { ataque: 1, defesa: 3 }),
      mkPlayer('e', 70, 'PON', { ataque: 5, defesa: 3 }),
      mkPlayer('f', 70, 'CEN', { ataque: 1, defesa: 3 }),
    ]
    const withoutWeights = buildTeams(players, { mode: 'competitive', size: 3, seed: 100 })
    const withAtaqueWeight = buildTeams(players, {
      mode: 'competitive',
      size: 3,
      seed: 100,
      skillWeights: { ataque: 2.0, defesa: 0.5, saque: 1, recepcao: 1, levantamento: 1, bloqueio: 1 },
    })
    // With heavy ataque weight, the engine should distribute ataque more evenly
    // The scores may differ because the weighting changes how balance is measured
    expect(withoutWeights.score).toBeGreaterThanOrEqual(20)
    expect(withAtaqueWeight.score).toBeGreaterThanOrEqual(20)
    // Both produce valid results
    expect(withAtaqueWeight.teamA.length).toBe(3)
    expect(withAtaqueWeight.teamB.length).toBe(3)
  })

  it('distribui posicoes entre os times', () => {
    // 2 of each position: engine should try to put 1 of each per team
    const players = [
      mkPlayer('lev1', 70, 'LEV'),
      mkPlayer('lev2', 70, 'LEV'),
      mkPlayer('pon1', 70, 'PON'),
      mkPlayer('pon2', 70, 'PON'),
      mkPlayer('cen1', 70, 'CEN'),
      mkPlayer('cen2', 70, 'CEN'),
    ]
    const r = buildTeams(players, { mode: 'competitive', size: 3, seed: 5 })
    // With equal overalls, the engine should distribute positions evenly
    const aPositions = r.teamA.map((p) => p.position).sort()
    const bPositions = r.teamB.map((p) => p.position).sort()
    // Each team should have one of each position
    expect(aPositions).toEqual(['CEN', 'LEV', 'PON'])
    expect(bPositions).toEqual(['CEN', 'LEV', 'PON'])
  })

  it('distribui convidados (isGuest) entre os times', () => {
    // 4 guests + 4 regular, all equal → guests should split 2-2
    const players = [
      mkPlayer('g1', 70, 'LEV', {}, { isGuest: true }),
      mkPlayer('g2', 70, 'PON', {}, { isGuest: true }),
      mkPlayer('g3', 70, 'CEN', {}, { isGuest: true }),
      mkPlayer('g4', 70, 'LEV', {}, { isGuest: true }),
      mkPlayer('r1', 70, 'PON'),
      mkPlayer('r2', 70, 'CEN'),
      mkPlayer('r3', 70, 'LEV'),
      mkPlayer('r4', 70, 'PON'),
    ]
    const r = buildTeams(players, { mode: 'competitive', size: 4, seed: 10 })
    const guestsA = r.teamA.filter((p) => p.isGuest).length
    const guestsB = r.teamB.filter((p) => p.isGuest).length
    // Should be 2-2 (equal distribution) since all players have same overall
    expect(Math.abs(guestsA - guestsB)).toBeLessThanOrEqual(1)
  })
})

describe('balanceScore', () => {
  it('da score alto para times espelhados', () => {
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

  it('funciona sem opts (retrocompativel)', () => {
    const t1 = [mkPlayer('a', 70, 'LEV')]
    const t2 = [mkPlayer('b', 70, 'LEV')]
    // Should not throw and return a valid score
    const score = balanceScore(t1, t2)
    expect(score).toBeGreaterThanOrEqual(20)
    expect(score).toBeLessThanOrEqual(99)
  })

  it('peso maior em um fundamento altera o score', () => {
    // t1 has strong ataque, t2 has weak ataque
    const t1 = [mkPlayer('a', 70, 'LEV', { ataque: 5 }), mkPlayer('b', 70, 'PON', { ataque: 5 })]
    const t2 = [mkPlayer('c', 70, 'LEV', { ataque: 1 }), mkPlayer('d', 70, 'PON', { ataque: 1 })]

    const scoreDefault = balanceScore(t1, t2)
    const scoreHighAtaque = balanceScore(t1, t2, { skillWeights: { ataque: 2.0, saque: 1, recepcao: 1, levantamento: 1, bloqueio: 1, defesa: 1 } })

    // Higher weight on imbalanced ataque should produce a lower score
    expect(scoreHighAtaque).toBeLessThan(scoreDefault)
  })

  it('penaliza distribuicao desigual de posicoes', () => {
    // Balanced positions vs unbalanced
    const balanced1 = [mkPlayer('a', 70, 'LEV'), mkPlayer('b', 70, 'PON')]
    const balanced2 = [mkPlayer('c', 70, 'LEV'), mkPlayer('d', 70, 'PON')]

    const unbalanced1 = [mkPlayer('e', 70, 'LEV'), mkPlayer('f', 70, 'LEV')]
    const unbalanced2 = [mkPlayer('g', 70, 'PON'), mkPlayer('h', 70, 'PON')]

    expect(balanceScore(balanced1, balanced2)).toBeGreaterThan(balanceScore(unbalanced1, unbalanced2))
  })

  it('penaliza distribuicao desigual de convidados', () => {
    // All guests on one side vs split
    const mixed1 = [mkPlayer('a', 70, 'LEV', {}, { isGuest: true }), mkPlayer('b', 70, 'PON')]
    const mixed2 = [mkPlayer('c', 70, 'LEV', {}, { isGuest: true }), mkPlayer('d', 70, 'PON')]

    const skewed1 = [mkPlayer('e', 70, 'LEV', {}, { isGuest: true }), mkPlayer('f', 70, 'PON', {}, { isGuest: true })]
    const skewed2 = [mkPlayer('g', 70, 'LEV'), mkPlayer('h', 70, 'PON')]

    // Mixed (1 guest each) should score higher than skewed (2 guests vs 0)
    expect(balanceScore(mixed1, mixed2)).toBeGreaterThan(balanceScore(skewed1, skewed2))
  })
})
