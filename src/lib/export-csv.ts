import { supabase } from '@/integrations/supabase/client'
import { SKILL_ORDER } from './constants'

function csvEscape(value: string | number | null | undefined): string {
  const s = value == null ? '' : String(value)
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

/** Exporta os alunos do coach (nome, posição, fundamentos, geral, V/D) como CSV. */
export async function exportStudentsCsv(): Promise<void> {
  const { data: students, error } = await supabase
    .from('students')
    .select('id, name, position')
    .order('name')
  if (error) throw new Error(error.message)
  if (!students || students.length === 0) throw new Error('Nenhum aluno para exportar.')

  const ids = students.map((s) => s.id)
  const [skillsRes, overallRes, statsRes] = await Promise.all([
    supabase.from('student_skills').select('student_id, skill_key, value').in('student_id', ids),
    supabase.from('v_student_overall').select('student_id, overall_rating').in('student_id', ids),
    supabase.from('v_student_match_stats').select('student_id, wins, losses').in('student_id', ids),
  ])

  const skillsByStudent = new Map<string, Record<string, number>>()
  for (const r of skillsRes.data ?? []) {
    const m = skillsByStudent.get(r.student_id) ?? {}
    m[r.skill_key] = r.value
    skillsByStudent.set(r.student_id, m)
  }
  const overallMap = new Map((overallRes.data ?? []).map((r) => [r.student_id, r.overall_rating]))
  const statsMap = new Map((statsRes.data ?? []).map((r) => [r.student_id, r]))

  const headers = ['Nome', 'Posição', 'Geral', ...SKILL_ORDER, 'Vitórias', 'Derrotas']
  const rows = students.map((s) => {
    const skills = skillsByStudent.get(s.id) ?? {}
    const stats = statsMap.get(s.id)
    return [
      s.name,
      s.position,
      overallMap.get(s.id) ?? '',
      ...SKILL_ORDER.map((k) => skills[k] ?? ''),
      stats?.wins ?? 0,
      stats?.losses ?? 0,
    ]
  })

  const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'alunos-esporte-recreacao.csv'
  a.click()
  URL.revokeObjectURL(url)
}
