// Constantes de domínio do Esporte Recreação

export const POSITIONS = {
  LEV: 'Levantador',
  PON: 'Ponteiro',
  OPO: 'Oposto',
  CEN: 'Central',
  LIB: 'Líbero',
} as const

export type PositionKey = keyof typeof POSITIONS

export const POSITION_KEYS = Object.keys(POSITIONS) as PositionKey[]

export const DOMINANT_HANDS = ['Destro', 'Canhoto', 'Ambidestro'] as const

export const TEAM_LEVELS = ['Iniciante', 'Intermediário', 'Avançado'] as const
export type TeamLevel = (typeof TEAM_LEVELS)[number]

export const ATTENDANCE_STATUS = {
  present: 'Presente',
  late: 'Atraso',
  absent: 'Falta',
} as const
export type AttendanceStatus = keyof typeof ATTENDANCE_STATUS

// Ordem dos fundamentos técnicos no player card
export const SKILL_ORDER = [
  'saque',
  'ataque',
  'recepcao',
  'levantamento',
  'bloqueio',
  'defesa',
] as const

export const SKILL_ABBR: Record<string, string> = {
  saque: 'Saq',
  ataque: 'Atq',
  recepcao: 'Rec',
  levantamento: 'Lev',
  bloqueio: 'BLOQ',
  defesa: 'Def',
  posicionamento: 'Pos',
}

export const MATCH_FORMATS = {
  single: 'Set único',
  best_of_3: 'Melhor de 3',
  best_of_5: 'Melhor de 5',
  timed: 'Por tempo',
} as const
export type MatchFormat = keyof typeof MATCH_FORMATS

export const ASSEMBLY_MODES = {
  competitive: 'Competitivo',
  development: 'Desenvolvimento',
} as const
export type AssemblyMode = keyof typeof ASSEMBLY_MODES

export const BENCH_POLICIES = {
  bench: 'Banco / rodízio',
  rotation: 'Rodízio',
} as const

export const TEAM_SIZES = ['2x2', '3x3', '4x4', '5x5', '6x6', '7x7'] as const

// Paleta determinística para avatares (derivada da marca)
export const AVATAR_COLORS: Array<[string, string]> = [
  ['#009C3B', '#fff'],
  ['#002776', '#fff'],
  ['#1A3C92', '#fff'],
  ['#F08C00', '#fff'],
  ['#006B29', '#fff'],
  ['#C99A00', '#2A1E00'],
  ['#00913A', '#fff'],
  ['#3055B0', '#fff'],
]

export const MIN_MATCHES_FOR_STATS = 5
