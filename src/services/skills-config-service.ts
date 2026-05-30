import { supabase } from '@/integrations/supabase/client'
import type { SkillConfig } from '@/types/domain'

export interface SkillConfigInput {
  label: string
  kind: 'technical' | 'soft'
  active: boolean
  weight: number
  sort_order: number
}

export const skillsConfigService = {
  async list(): Promise<SkillConfig[]> {
    const { data, error } = await supabase
      .from('skill_configs')
      .select('*')
      .order('kind', { ascending: true })
      .order('sort_order', { ascending: true })
    if (error) throw new Error(error.message)
    return data
  },

  async create(input: { label: string; kind: 'technical' | 'soft'; sort_order: number }): Promise<SkillConfig> {
    // key derivada do label (slug), imutável após criação (SEC-A1)
    const key = slugify(input.label) + '_' + Math.random().toString(36).slice(2, 6)
    const { data, error } = await supabase
      .from('skill_configs')
      .insert({ key, label: input.label, kind: input.kind, sort_order: input.sort_order })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  // NUNCA envia `key` no update (SEC-A1)
  async update(
    id: string,
    patch: Partial<Pick<SkillConfig, 'label' | 'active' | 'weight' | 'sort_order'>>,
  ): Promise<void> {
    const { error } = await supabase.from('skill_configs').update(patch).eq('id', id)
    if (error) throw new Error(error.message)
  },

  async reorder(items: { id: string; sort_order: number }[]): Promise<void> {
    for (const it of items) {
      const { error } = await supabase
        .from('skill_configs')
        .update({ sort_order: it.sort_order })
        .eq('id', it.id)
      if (error) throw new Error(error.message)
    }
  },
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 24)
}
