import { z } from 'zod'

export const branchSchema = z.object({
  name: z.string().min(1, 'Informe o nome da filial').max(100, 'Nome muito longo'),
  city: z.string().max(100).optional().default(''),
  address: z.string().max(160).optional().default(''),
  phone: z.string().max(40).optional().default(''),
  manager_name: z.string().max(100).optional().default(''),
})

export type BranchInput = z.infer<typeof branchSchema>
