import { supabase } from '@/integrations/supabase/client'
import type { Evaluation } from '@/types/domain'

export interface EvaluationSkillInput {
  skill_key: string
  value: number
  previous: number
}

export interface SaveEvaluationParams {
  sessionId: string
  studentId: string
  engagement: number
  notes: string
  skills: EvaluationSkillInput[]
}

export const evaluationService = {
  /** Upsert da avaliação do aluno no treino + ajustes de fundamento (trigger atualiza snapshot). */
  async save(params: SaveEvaluationParams): Promise<Evaluation> {
    const { sessionId, studentId, engagement, notes, skills } = params
    // clamp de segurança: o banco exige engagement entre 1 e 5 (CHECK). Qualquer 0/inválido vira 3 (neutro).
    const safeEngagement = engagement >= 1 && engagement <= 5 ? engagement : 3

    const { data: evaluation, error } = await supabase
      .from('evaluations')
      .upsert(
        { session_id: sessionId, student_id: studentId, engagement: safeEngagement, notes },
        { onConflict: 'session_id,student_id' },
      )
      .select()
      .single()
    if (error) throw new Error(error.message)

    // limpa ajustes anteriores desta avaliação e regrava
    await supabase.from('evaluation_skills').delete().eq('evaluation_id', evaluation.id)

    const rows = skills.map((s) => ({
      evaluation_id: evaluation.id,
      skill_key: s.skill_key,
      value: s.value,
      direction: s.value > s.previous ? 'up' : s.value < s.previous ? 'down' : 'stable',
    }))
    if (rows.length > 0) {
      const { error: sErr } = await supabase.from('evaluation_skills').insert(rows)
      if (sErr) throw new Error(sErr.message)
    }
    return evaluation
  },

  async listBySession(sessionId: string): Promise<Evaluation[]> {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('session_id', sessionId)
    if (error) throw new Error(error.message)
    return data
  },
}
