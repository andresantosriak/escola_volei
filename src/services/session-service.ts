import { supabase } from '@/integrations/supabase/client'
import type { TrainingSession } from '@/types/domain'
import type { AttendanceStatus } from '@/lib/constants'

export interface AttendanceInput {
  studentId: string
  status: AttendanceStatus
}

export const sessionService = {
  /** Cria a sessão de treino e grava as presenças. Retorna o id da sessão. */
  async createWithAttendance(
    teamId: string,
    attendance: AttendanceInput[],
  ): Promise<TrainingSession> {
    const { data: session, error } = await supabase
      .from('training_sessions')
      .insert({ team_id: teamId })
      .select()
      .single()
    if (error) throw new Error(error.message)

    if (attendance.length > 0) {
      const { error: aErr } = await supabase.from('attendances').insert(
        attendance.map((a) => ({
          session_id: session.id,
          student_id: a.studentId,
          status: a.status,
        })),
      )
      if (aErr) throw new Error(aErr.message)
    }
    return session
  },

  async get(id: string): Promise<TrainingSession> {
    const { data, error } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw new Error(error.message)
    return data
  },
}
