import { z } from 'zod'

export const evaluationSchema = z.object({
  engagement: z.number().int().min(1).max(5).default(3),
  notes: z.string().max(500).optional().default(''),
  skills: z.record(z.string(), z.number().int().min(1).max(5)).default({}),
})

export type EvaluationInput = z.infer<typeof evaluationSchema>
