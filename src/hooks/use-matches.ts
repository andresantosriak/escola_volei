import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { matchService, type CreateMatchParams } from '@/services/match-service'

export function useMatches(teamId?: string) {
  return useQuery({
    queryKey: ['matches', { teamId: teamId ?? null }],
    queryFn: () => matchService.list(teamId),
  })
}

export function useMatch(id: string | undefined) {
  return useQuery({
    queryKey: ['matches', id],
    queryFn: () => matchService.get(id!),
    enabled: !!id,
  })
}

export function useMatchMutations() {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['matches'] })
    qc.invalidateQueries({ queryKey: ['students'] }) // V/D recalcula
  }

  const create = useMutation({
    mutationFn: (params: CreateMatchParams) => matchService.create(params),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (id: string) => matchService.remove(id),
    onSuccess: invalidate,
  })

  return { create, remove }
}
