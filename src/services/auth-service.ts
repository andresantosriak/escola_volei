import { supabase } from '@/integrations/supabase/client'
import type { LoginInput, RegisterInput } from '@/schemas/auth-schema'

export const authService = {
  async signIn({ email, password }: LoginInput) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(mapAuthError(error.message))
  },

  async signUp({ email, password, fullName }: RegisterInput) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw new Error(mapAuthError(error.message))
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error('Não foi possível sair. Tente novamente.')
  },

  async resetPasswordForEmail(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw new Error('Não foi possível enviar o e-mail de recuperação.')
  },

  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw new Error('Não foi possível atualizar a senha.')
  },

  async getUser() {
    const { data } = await supabase.auth.getUser()
    return data.user
  },
}

// Mensagens genéricas — nunca revelar se um e-mail existe (SEC)
function mapAuthError(msg: string): string {
  const m = msg.toLowerCase()
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (m.includes('email not confirmed') || m.includes('email_not_confirmed'))
    return 'Confirme seu e-mail antes de entrar (verifique sua caixa de entrada).'
  if (m.includes('already registered') || m.includes('already been registered'))
    return 'Não foi possível concluir o cadastro. Tente fazer login.'
  if (m.includes('rate limit') || m.includes('too many'))
    return 'Muitas tentativas. Aguarde um momento e tente novamente.'
  if (m.includes('network') || m.includes('failed to fetch'))
    return 'Sem conexão. Verifique sua internet.'
  return 'Algo deu errado. Tente novamente.'
}
