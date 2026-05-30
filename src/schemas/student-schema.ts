import { z } from 'zod'

const POSITION_ENUM = ['LEV', 'PON', 'OPO', 'CEN', 'LIB'] as const
const POSITION_WITH_EMPTY = ['', 'LEV', 'PON', 'OPO', 'CEN', 'LIB'] as const
const HAND_WITH_EMPTY = ['', 'Destro', 'Canhoto', 'Ambidestro'] as const

export const studentSchema = z.object({
  name: z.string().min(1, 'Informe o nome').max(100, 'Nome muito longo'),
  position: z.enum(POSITION_WITH_EMPTY).default(''),
  alternate_positions: z.array(z.enum(POSITION_ENUM)).default([]),
  age: z.coerce.number().int().min(1).max(99).nullable().optional(),
  height_cm: z.coerce.number().int().min(50).max(250).nullable().optional(),
  dominant_hand: z.enum(HAND_WITH_EMPTY).default(''),
  guardian_name: z.string().max(100).optional().default(''),
  guardian_phone: z.string().max(40).optional().default(''),
  notes: z.string().max(500).optional().default(''),
  team_ids: z.array(z.string()).default([]),
})

export type StudentInput = z.infer<typeof studentSchema>
