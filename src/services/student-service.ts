import { supabase } from '@/integrations/supabase/client'
import { storageService } from '@/services/storage-service'
import type { Student } from '@/types/domain'
import type { StudentInput } from '@/schemas/student-schema'

export interface StudentListItem extends Student {
  overall: number
}

export interface StudentFull extends Student {
  overall: number
  wins: number
  losses: number
  total_matches: number
  skills: Record<string, number>
  team_ids: string[]
  photo_url: string | null
}

const studentColumns = `id, coach_id, name, position, alternate_positions, age, height_cm,
  dominant_hand, photo_path, guardian_name, guardian_phone, notes, parental_consent,
  created_at, updated_at`

function splitInput(input: StudentInput) {
  const { team_ids, ...fields } = input
  const payload = {
    ...fields,
    age: fields.age ?? null,
    height_cm: fields.height_cm ?? null,
  }
  return { payload, teamIds: team_ids ?? [] }
}

export const studentService = {
  async listByTeam(teamId?: string): Promise<StudentListItem[]> {
    if (teamId) {
      const { data, error } = await supabase
        .from('team_students')
        .select(`student:students(${studentColumns})`)
        .eq('team_id', teamId)
      if (error) throw new Error(error.message)
      const students = (data ?? [])
        .map((r) => (r as { student: Student }).student)
        .filter(Boolean)
      return attachOverall(students)
    }
    const { data, error } = await supabase
      .from('students')
      .select(studentColumns)
      .order('name', { ascending: true })
    if (error) throw new Error(error.message)
    return attachOverall(data as Student[])
  },

  async roster(teamId: string): Promise<Student[]> {
    const { data, error } = await supabase
      .from('team_students')
      .select(`student:students(${studentColumns})`)
      .eq('team_id', teamId)
    if (error) throw new Error(error.message)
    return (data ?? []).map((r) => (r as { student: Student }).student).filter(Boolean)
  },

  async get(id: string): Promise<StudentFull> {
    const { data, error } = await supabase
      .from('students')
      .select(studentColumns)
      .eq('id', id)
      .single()
    if (error) throw new Error(error.message)

    const [skillsRes, overallRes, statsRes, teamsRes] = await Promise.all([
      supabase.from('student_skills').select('skill_key, value').eq('student_id', id),
      supabase.from('v_student_overall').select('overall_rating').eq('student_id', id).maybeSingle(),
      supabase
        .from('v_student_match_stats')
        .select('wins, losses, total_matches')
        .eq('student_id', id)
        .maybeSingle(),
      supabase.from('team_students').select('team_id').eq('student_id', id),
    ])

    const skills: Record<string, number> = {}
    for (const row of skillsRes.data ?? []) skills[row.skill_key] = row.value

    const student = data as Student
    const photo_url = await storageService.getSignedUrl(student.photo_path)

    return {
      ...student,
      overall: overallRes.data?.overall_rating ?? 73,
      wins: statsRes.data?.wins ?? 0,
      losses: statsRes.data?.losses ?? 0,
      total_matches: statsRes.data?.total_matches ?? 0,
      skills,
      team_ids: (teamsRes.data ?? []).map((t) => t.team_id),
      photo_url,
    }
  },

  async create(input: StudentInput): Promise<Student> {
    const { payload, teamIds } = splitInput(input)
    const { data, error } = await supabase.from('students').insert(payload).select().single()
    if (error) throw new Error(error.message)
    await syncTeams(data.id, teamIds, [])
    return data
  },

  async update(id: string, input: StudentInput, currentTeamIds: string[]): Promise<Student> {
    const { payload, teamIds } = splitInput(input)
    const { data, error } = await supabase
      .from('students')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    await syncTeams(id, teamIds, currentTeamIds)
    return data
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('students').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },
}

async function attachOverall(students: Student[]): Promise<StudentListItem[]> {
  if (students.length === 0) return []
  const ids = students.map((s) => s.id)
  const { data } = await supabase
    .from('v_student_overall')
    .select('student_id, overall_rating')
    .in('student_id', ids)
  const map = new Map((data ?? []).map((r) => [r.student_id, r.overall_rating]))
  return students.map((s) => ({ ...s, overall: map.get(s.id) ?? 73 }))
}

async function syncTeams(studentId: string, next: string[], current: string[]) {
  const toAdd = next.filter((t) => !current.includes(t))
  const toRemove = current.filter((t) => !next.includes(t))
  if (toAdd.length) {
    const { error } = await supabase
      .from('team_students')
      .insert(toAdd.map((team_id) => ({ team_id, student_id: studentId })))
    if (error) throw new Error(error.message)
  }
  if (toRemove.length) {
    const { error } = await supabase
      .from('team_students')
      .delete()
      .eq('student_id', studentId)
      .in('team_id', toRemove)
    if (error) throw new Error(error.message)
  }
}
