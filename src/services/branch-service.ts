import { supabase } from '@/integrations/supabase/client'
import type { Branch } from '@/types/domain'
import type { BranchInput } from '@/schemas/branch-schema'

export const branchService = {
  async list(): Promise<Branch[]> {
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) throw new Error(error.message)
    return data
  },

  async get(id: string): Promise<Branch> {
    const { data, error } = await supabase.from('branches').select('*').eq('id', id).single()
    if (error) throw new Error(error.message)
    return data
  },

  async create(input: BranchInput): Promise<Branch> {
    const { data, error } = await supabase.from('branches').insert(input).select().single()
    if (error) throw new Error(error.message)
    return data
  },

  async update(id: string, input: Partial<BranchInput>): Promise<Branch> {
    const { data, error } = await supabase
      .from('branches')
      .update(input)
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async setArchived(id: string, archived: boolean): Promise<void> {
    const { error } = await supabase.from('branches').update({ archived }).eq('id', id)
    if (error) throw new Error(error.message)
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('branches').delete().eq('id', id)
    if (error) {
      // Trigger fn_prevent_branch_delete_with_active_teams (RN06)
      if (error.message.includes('active teams') || error.message.includes('turmas ativas')) {
        throw new Error('Esta filial tem turmas ativas. Arquive ou exclua as turmas antes.')
      }
      throw new Error(error.message)
    }
  },

  async activeTeamCount(branchId: string): Promise<number> {
    const { count, error } = await supabase
      .from('teams')
      .select('id', { count: 'exact', head: true })
      .eq('branch_id', branchId)
      .eq('archived', false)
    if (error) throw new Error(error.message)
    return count ?? 0
  },
}
