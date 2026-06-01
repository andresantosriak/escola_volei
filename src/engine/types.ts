// Tipos da engine de balanceamento — pure TS, sem React/Supabase

export type EnginePosition = 'LEV' | 'PON' | 'OPO' | 'CEN' | 'LIB' | ''

export interface EnginePlayer {
  id: string
  name: string
  position: EnginePosition
  alternatePositions: EnginePosition[]
  overall: number
  /** fundamentos técnicos (key -> valor 1-5) usados no cálculo de equilíbrio por fundamento */
  skills: Record<string, number>
}

export type AssemblyMode = 'competitive' | 'development'

/**
 * Política de quem descansa quando há mais presentes do que vagas:
 * - 'bench'    → reservas naturais: os de maior overall jogam sempre; só a fronteira rotaciona.
 * - 'rotation' → rodízio justo: a cada montagem todos têm chance de descansar (banco rotaciona).
 */
export type BenchPolicy = 'bench' | 'rotation'

export interface BuildOptions {
  mode: AssemblyMode
  /** jogadores por time (ex: 6 para 6x6) */
  size: number
  /** política de banco/rodízio (default 'bench') */
  benchPolicy?: BenchPolicy
  /** semente para RNG determinística (testes/reprodutibilidade) */
  seed?: number
}

export type Tier = 'topo' | 'meio' | 'base'

export interface TierCounts {
  topo: number
  meio: number
  base: number
}

export interface BuildResult {
  teamA: EnginePlayer[]
  teamB: EnginePlayer[]
  bench: EnginePlayer[]
  perTeam: number
  score: number
  mode: AssemblyMode
  size: number
  mixed: boolean
  levOk: boolean
  levTotal: number
  tiers: { teamA: TierCounts; teamB: TierCounts }
  tierMap: Record<string, Tier>
}
