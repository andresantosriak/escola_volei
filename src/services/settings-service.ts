import { supabase } from '@/integrations/supabase/client'
import type { Settings } from '@/types/domain'

export interface SettingsUpdate {
  height_unit?: 'cm' | 'ft'
  team_size?: string
  assembly_mode?: 'competitive' | 'development'
  bench_policy?: 'bench' | 'rotation'
  theme?: 'light' | 'dark' | 'system'
  show_weights?: boolean
}

export const settingsService = {
  async get(): Promise<Settings | null> {
    const { data, error } = await supabase.from('settings').select('*').maybeSingle()
    if (error) throw new Error(error.message)
    return data
  },

  async update(patch: SettingsUpdate): Promise<void> {
    const { data: existing } = await supabase.from('settings').select('id').maybeSingle()
    if (!existing) {
      const { data: userData } = await supabase.auth.getUser()
      const coachId = userData.user?.id
      if (!coachId) throw new Error('Sessão expirada. Faça login novamente.')
      const { error } = await supabase.from('settings').insert({ ...patch, coach_id: coachId })
      if (error) throw new Error(error.message)
      return
    }
    const { error } = await supabase.from('settings').update(patch).eq('id', existing.id)
    if (error) throw new Error(error.message)
  },
}
