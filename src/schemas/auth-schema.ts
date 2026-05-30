import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido'),
  password: z.string().min(1, 'Informe sua senha'),
})

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Informe seu nome'),
  email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido'),
  password: z.string().min(6, 'A senha precisa ter ao menos 6 caracteres'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido'),
})

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'A senha precisa ter ao menos 6 caracteres'),
    confirm: z.string().min(6, 'Confirme a senha'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'As senhas não coincidem',
    path: ['confirm'],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
