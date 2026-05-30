import { supabase } from '@/integrations/supabase/client'
import type { Team } from '@/types/domain'
import type { ClassInput } from '@/schemas/class-schema'

export interface TeamWithCount extends Team {
  student_count: number
  branch_name?: string
}

function normalize(input: ClassInput) {
  return { ...input, schedule_time: input.schedule_time ? input.schedule_time : null }
}

export const classService = {
  async list(branchId?: string): Promise<TeamWithCount[]> {
    let query = supabase
      .from('teams')
      .select('*, branches(name), team_students(count)')
      .order('created_at', { ascending: true })
    if (branchId) query = query.eq('branch_id', branchId)
    const { data, error } = await query
    if (error) throw new Error(error.message)
    return (data ?? []).map((t) => {
      const { branches, team_students, ...rest } = t as typeof t & {
        branches: { name: string } | null
        team_students: { count: number }[]
      }
      return {
        ...(rest as Team),
        student_count: team_students?.[0]?.count ?? 0,
        branch_name: branches?.name,
      }
    })
  },

  async get(id: string): Promise<Team> {
    const { data, error } = await supabase.from('teams').select('*').eq('id', id).single()
    if (error) throw new Error(error.message)
    return data
  },

  async create(input: ClassInput): Promise<Team> {
    const { data, error } = await supabase.from('teams').insert(normalize(input)).select().single()
    if (error) throw new Error(error.message)
    return data
  },

  async update(id: string, input: Partial<ClassInput>): Promise<Team> {
    const payload = input.schedule_time !== undefined ? normalize(input as ClassInput) : input
    const { data, error } = await supabase
      .from('teams')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async setArchived(id: string, archived: boolean): Promise<void> {
    const { error } = await supabase.from('teams').update({ archived }).eq('id', id)
    if (error) throw new Error(error.message)
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('teams').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },
}
