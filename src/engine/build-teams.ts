import type { BenchPolicy, BuildOptions, BuildResult, EnginePlayer } from './types'
import { balanceScore, canSetter } from './balance-score'
import { isMixed, tierMap, tiersOf } from './tier-map'

/** PRNG determinística (mulberry32) — permite seed para reprodutibilidade em testes. */
function makeRng(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Fisher-Yates in-place usando o RNG fornecido. */
function shuffle<T>(arr: T[], rng: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (rng() * (i + 1)) | 0
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function levCount(players: EnginePlayer[]): number {
  return players.filter(canSetter).length
}

/**
 * Escolhe 2*perTeam jogadores; o resto vai pro banco.
 * - rotation: rodízio justo — embaralha TODOS antes de cortar, então qualquer um pode descansar.
 * - bench (default): mantém os de maior overall jogando, mas ROTACIONA a fronteira do corte
 *   (jogadores com overall igual/próximo ao do último que entra) para o banco não ficar imóvel
 *   entre reequilíbrios. Sempre prioriza manter ao menos 1 levantador em quadra.
 */
function selectPlaying(
  present: EnginePlayer[],
  size: number,
  benchPolicy: BenchPolicy,
  rng: () => number,
) {
  const perTeam = Math.min(size, Math.floor(present.length / 2))
  const slots = 2 * perTeam

  // todos jogam (não há banco) → caminho trivial
  if (slots >= present.length) {
    return { playing: [...present], bench: [], perTeam }
  }

  if (benchPolicy === 'rotation') {
    // rodízio total: embaralha e corta — todos têm a mesma chance de descansar
    const pool = shuffle([...present], rng)
    let playing = pool.slice(0, slots)
    const bench = pool.slice(slots)
    playing = ensureSetter(playing, bench, rng)
    return { playing, bench, perTeam }
  }

  // bench: ordena por overall desc, mas rotaciona quem está na FRONTEIRA do corte
  const byForce = [...present].sort((a, b) => b.overall - a.overall)
  const lastIn = byForce[slots - 1].overall
  // zona de fronteira: todos com overall dentro de 4 pontos do último que entra (empate "técnico")
  const TIE = 4
  const locked = byForce.filter((p) => p.overall > lastIn + TIE) // entram sempre
  const frontier = shuffle(
    byForce.filter((p) => p.overall <= lastIn + TIE && p.overall >= lastIn - TIE),
    rng,
  )
  const benchFixed = byForce.filter((p) => p.overall < lastIn - TIE) // descansam sempre
  const needFromFrontier = slots - locked.length
  let playing = [...locked, ...frontier.slice(0, needFromFrontier)]
  const bench = [...benchFixed, ...frontier.slice(needFromFrontier)]
  playing = ensureSetter(playing, bench, rng)
  return { playing, bench, perTeam }
}

/** Garante ao menos 1 levantador em quadra trocando com um do banco, se possível. */
function ensureSetter(playing: EnginePlayer[], bench: EnginePlayer[], rng: () => number) {
  if (bench.length === 0 || playing.some(canSetter)) return playing
  const benchSetterIdx = bench.findIndex(canSetter)
  if (benchSetterIdx < 0) return playing
  // troca um jogador não-levantador de menor overall por um levantador do banco
  const outIdx = playing
    .map((p, i) => ({ i, o: p.overall }))
    .sort((a, b) => a.o - b.o)[0]?.i
  if (outIdx == null) return playing
  const setter = bench[benchSetterIdx]
  const out = playing[outIdx]
  playing[outIdx] = setter
  bench[benchSetterIdx] = out
  void rng
  return playing
}

/**
 * Divide os presentes em 2 times equilibrados.
 * 600 restarts randomizados + 1 passo de local-swap por restart. Porte de buildTeams() (data.js).
 * Modo Competitivo: maximiza o índice de equilíbrio.
 * Modo Desenvolvimento: força mistura de níveis (topo+base em cada time) e, dentro disso, equilíbrio.
 */
export function buildTeams(present: EnginePlayer[], opts: BuildOptions): BuildResult {
  const mode = opts.mode
  const size = opts.size
  const benchPolicy = opts.benchPolicy ?? 'bench'
  const rng = makeRng(opts.seed ?? 0x9e3779b9)

  const skillWeights = opts.skillWeights
  const balOpts = skillWeights ? { skillWeights } : undefined

  const { playing, bench, perTeam } = selectPlaying(present, size, benchPolicy, rng)
  const tm = tierMap(present)
  const bothTiers =
    playing.some((p) => tm[p.id] === 'topo') && playing.some((p) => tm[p.id] === 'base')

  const evaluate = (t1: EnginePlayer[], t2: EnginePlayer[]): number => {
    const bal = balanceScore(t1, t2, balOpts)
    if (mode === 'development') {
      const mixed = !bothTiers || isMixed(t1, t2, tm)
      return (mixed ? 1000 : 0) + bal
    }
    return bal
  }

  let best: { t1: EnginePlayer[]; t2: EnginePlayer[] } | null = null
  let bestObj = -Infinity
  const tries = 600

  for (let k = 0; k < tries; k++) {
    const sh = [...playing]
    for (let i = sh.length - 1; i > 0; i--) {
      const j = (rng() * (i + 1)) | 0
      ;[sh[i], sh[j]] = [sh[j], sh[i]]
    }
    let t1 = sh.slice(0, perTeam)
    let t2 = sh.slice(perTeam, 2 * perTeam)
    let obj = evaluate(t1, t2)
    // local-swap: tenta trocas que aumentam o objetivo
    for (let a = 0; a < t1.length; a++) {
      for (let b = 0; b < t2.length; b++) {
        const n1 = [...t1]
        const n2 = [...t2]
        ;[n1[a], n2[b]] = [n2[b], n1[a]]
        const o = evaluate(n1, n2)
        if (o > obj) {
          t1 = n1
          t2 = n2
          obj = o
        }
      }
    }
    if (obj > bestObj) {
      bestObj = obj
      best = { t1, t2 }
    }
  }

  const t1 = best?.t1 ?? []
  const t2 = best?.t2 ?? []
  const mixed = bothTiers && isMixed(t1, t2, tm)
  const lev1 = t1.some(canSetter)
  const lev2 = t2.some(canSetter)

  return {
    teamA: t1,
    teamB: t2,
    bench,
    perTeam,
    score: balanceScore(t1, t2, balOpts),
    mode,
    size,
    mixed,
    levOk: lev1 && lev2,
    levTotal: levCount(present),
    tiers: { teamA: tiersOf(t1, tm), teamB: tiersOf(t2, tm) },
    tierMap: tm,
  }
}
