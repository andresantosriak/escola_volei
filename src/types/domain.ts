import type { Database } from '@/integrations/supabase/client-types'

type Tables = Database['public']['Tables']
type Views = Database['public']['Views']

export type Branch = Tables['branches']['Row']
export type BranchInsert = Tables['branches']['Insert']
export type BranchUpdate = Tables['branches']['Update']

export type Team = Tables['teams']['Row']
export type TeamInsert = Tables['teams']['Insert']
export type TeamUpdate = Tables['teams']['Update']

export type Student = Tables['students']['Row']
export type StudentInsert = Tables['students']['Insert']
export type StudentUpdate = Tables['students']['Update']

export type SkillConfig = Tables['skill_configs']['Row']
export type StudentSkill = Tables['student_skills']['Row']
export type TrainingSession = Tables['training_sessions']['Row']
export type Attendance = Tables['attendances']['Row']
export type Evaluation = Tables['evaluations']['Row']
export type EvaluationSkill = Tables['evaluation_skills']['Row']
export type Match = Tables['matches']['Row']
export type MatchSet = Tables['match_sets']['Row']
export type MatchRoster = Tables['match_rosters']['Row']
export type Settings = Tables['settings']['Row']

export type StudentOverall = Views['v_student_overall']['Row']
export type StudentMatchStats = Views['v_student_match_stats']['Row']
export type StudentAttendanceStats = Views['v_student_attendance_stats']['Row']

// ---- Composites usados na UI ----
export interface StudentWithStats extends Student {
  overall: number
  wins: number
  losses: number
}

export interface StudentSkillsMap {
  [skillKey: string]: number
}

export interface MatchWithDetail extends Match {
  sets: MatchSet[]
  rosters: MatchRoster[]
}

export type AttendanceStatus = 'present' | 'absent' | 'late'
export type MatchSide = 'a' | 'b'
