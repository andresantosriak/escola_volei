import { z } from 'zod'
import { TEAM_LEVELS } from '@/lib/constants'

export const classSchema = z.object({
  name: z.string().min(1, 'Informe o nome da turma').max(100, 'Nome muito longo'),
  branch_id: z.string().min(1, 'Selecione a filial'),
  schedule_days: z.string().max(60).optional().default(''),
  schedule_time: z.string().optional().default(''),
  level: z.enum(TEAM_LEVELS).default('Iniciante'),
  age_group: z.string().max(40).optional().default(''),
  instructor_name: z.string().max(100).optional().default(''),
})

export type ClassInput = z.infer<typeof classSchema>
