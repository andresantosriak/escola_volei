import { z } from 'zod'

export const MATCH_FORMAT_KEYS = ['single', 'best_of_3', 'best_of_5', 'timed'] as const

export const matchSetSchema = z.object({
  points_a: z.number().int().min(0),
  points_b: z.number().int().min(0),
})

export const matchSchema = z.object({
  format: z.enum(MATCH_FORMAT_KEYS).default('single'),
  team_a_name: z.string().min(1).max(40).default('Time A'),
  team_b_name: z.string().min(1).max(40).default('Time B'),
  sets: z.array(matchSetSchema).min(1, 'Adicione ao menos 1 set'),
  winner: z.enum(['a', 'b']).nullable(),
  walkover: z.boolean().default(false),
})

export type MatchInput = z.infer<typeof matchSchema>
export type MatchSetInput = z.infer<typeof matchSetSchema>

/** Vencedor automático: quem ganhou mais sets. null em empate. (RN07) */
export function computeWinner(sets: MatchSetInput[]): 'a' | 'b' | null {
  let a = 0
  let b = 0
  for (const s of sets) {
    if (s.points_a > s.points_b) a++
    else if (s.points_b > s.points_a) b++
  }
  if (a === b) return null
  return a > b ? 'a' : 'b'
}

export function setsWon(sets: MatchSetInput[]): { a: number; b: number } {
  let a = 0
  let b = 0
  for (const s of sets) {
    if (s.points_a > s.points_b) a++
    else if (s.points_b > s.points_a) b++
  }
  return { a, b }
}
