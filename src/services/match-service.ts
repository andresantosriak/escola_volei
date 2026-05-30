import { supabase } from '@/integrations/supabase/client'
import type { Match, MatchSet, Student } from '@/types/domain'
import type { MatchInput } from '@/schemas/match-schema'

export interface CreateMatchParams {
  teamId: string
  sessionId: string | null
  input: MatchInput
  balanceScore: number | null
  rosterA: string[]
  rosterB: string[]
}

export interface MatchListItem extends Match {
  set_summary: string
  sets_a: number
  sets_b: number
  roster_a?: string[]
  roster_b?: string[]
}

export interface MatchDetailData extends Match {
  sets: MatchSet[]
  rostersA: Student[]
  rostersB: Student[]
}

const studentCols = 'id, name, position'

export const matchService = {
  async create(params: CreateMatchParams): Promise<Match> {
    const { teamId, sessionId, input, balanceScore, rosterA, rosterB } = params
    const { data: match, error } = await supabase
      .from('matches')
      .insert({
        team_id: teamId,
        session_id: sessionId,
        format: input.format,
        team_a_name: input.team_a_name,
        team_b_name: input.team_b_name,
        winner: input.winner,
        walkover: input.walkover,
        balance_score: balanceScore,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)

    if (input.sets.length > 0) {
      const { error: sErr } = await supabase.from('match_sets').insert(
        input.sets.map((s, i) => ({
          match_id: match.id,
          set_number: i + 1,
          points_a: s.points_a,
          points_b: s.points_b,
        })),
      )
      if (sErr) throw new Error(sErr.message)
    }

    const rosters = [
      ...rosterA.map((student_id) => ({ match_id: match.id, student_id, side: 'a' as const })),
      ...rosterB.map((student_id) => ({ match_id: match.id, student_id, side: 'b' as const })),
    ]
    if (rosters.length > 0) {
      const { error: rErr } = await supabase.from('match_rosters').insert(rosters)
      if (rErr) throw new Error(rErr.message)
    }
    return match
  },

  async list(teamId?: string): Promise<MatchListItem[]> {
    let query = supabase
      .from('matches')
      .select('*, match_sets(set_number, points_a, points_b), match_rosters(side, student:students(name))')
      .order('match_date', { ascending: false })
      .order('created_at', { ascending: false })
    if (teamId) query = query.eq('team_id', teamId)
    const { data, error } = await query
    if (error) throw new Error(error.message)

    return (data ?? []).map((m) => {
      const row = m as Match & {
        match_sets: Array<{ set_number: number; points_a: number; points_b: number }>
        match_rosters: Array<{ side: 'a' | 'b'; student: { name: string } | null }>
      }
      const sets = (row.match_sets ?? []).slice().sort((a, b) => a.set_number - b.set_number)
      let sa = 0
      let sb = 0
      for (const s of sets) {
        if (s.points_a > s.points_b) sa++
        else if (s.points_b > s.points_a) sb++
      }
      const firstNames = (side: 'a' | 'b') =>
        (row.match_rosters ?? [])
          .filter((r) => r.side === side && r.student)
          .map((r) => r.student!.name.split(' ')[0])
      const { match_sets: _ms, match_rosters: _mr, ...rest } = row
      return {
        ...(rest as Match),
        set_summary: sets.map((s) => `${s.points_a}–${s.points_b}`).join(' · '),
        sets_a: sa,
        sets_b: sb,
        roster_a: firstNames('a'),
        roster_b: firstNames('b'),
      }
    })
  },

  async get(id: string): Promise<MatchDetailData> {
    const { data: match, error } = await supabase.from('matches').select('*').eq('id', id).single()
    if (error) throw new Error(error.message)

    const [setsRes, rostersRes] = await Promise.all([
      supabase.from('match_sets').select('*').eq('match_id', id).order('set_number'),
      supabase.from('match_rosters').select(`side, student:students(${studentCols})`).eq('match_id', id),
    ])

    const rostersA: Student[] = []
    const rostersB: Student[] = []
    for (const r of rostersRes.data ?? []) {
      const row = r as { side: 'a' | 'b'; student: Student }
      if (!row.student) continue
      if (row.side === 'a') rostersA.push(row.student)
      else rostersB.push(row.student)
    }

    return { ...(match as Match), sets: setsRes.data ?? [], rostersA, rostersB }
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('matches').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },
}
