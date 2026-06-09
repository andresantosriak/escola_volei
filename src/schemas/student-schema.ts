import { z } from 'zod'

const POSITION_ENUM = ['LEV', 'PON', 'OPO', 'CEN', 'LIB'] as const
const POSITION_WITH_EMPTY = ['', 'LEV', 'PON', 'OPO', 'CEN', 'LIB'] as const
const HAND_WITH_EMPTY = ['', 'Destro', 'Canhoto', 'Ambidestro'] as const

/** Coerce empty-ish values to null so z.coerce.number() won't turn '' into 0 */
const emptyToNull = (v: unknown) =>
  v === '' || v === null || v === undefined ? null : v

export const studentSchema = z.object({
  name: z.string().max(100, 'Nome muito longo').optional().default(''),
  position: z.enum(POSITION_WITH_EMPTY).default(''),
  alternate_positions: z.array(z.enum(POSITION_ENUM)).default([]),
  age: z
    .preprocess(
      emptyToNull,
      z.coerce
        .number()
        .int('Idade inválida')
        .min(1, 'Idade mínima: 1')
        .max(99, 'Idade máxima: 99')
        .nullable(),
    )
    .optional(),
  height_cm: z
    .preprocess(
      emptyToNull,
      z.coerce
        .number()
        .int('Altura inválida')
        .min(50, 'Altura mínima: 50 cm')
        .max(250, 'Altura máxima: 250 cm')
        .nullable(),
    )
    .optional(),
  dominant_hand: z.enum(HAND_WITH_EMPTY).default(''),
  guardian_name: z.string().max(100).optional().default(''),
  guardian_phone: z.string().max(40).optional().default(''),
  notes: z.string().max(500).optional().default(''),
  team_ids: z.array(z.string()).default([]),
})

export type StudentInput = z.infer<typeof studentSchema>
