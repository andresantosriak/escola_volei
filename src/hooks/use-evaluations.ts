import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { evaluationService, type SaveEvaluationParams } from '@/services/evaluation-service'

export function useSessionEvaluations(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['evaluations', sessionId],
    queryFn: () => evaluationService.listBySession(sessionId!),
    enabled: !!sessionId,
  })
}

export function useEvaluationMutations() {
  const qc = useQueryClient()
  const save = useMutation({
    mutationFn: (params: SaveEvaluationParams) => evaluationService.save(params),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['evaluations', vars.sessionId] })
      qc.invalidateQueries({ queryKey: ['students'] }) // overall recalcula
    },
  })
  return { save }
}
