import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { branchService } from '@/services/branch-service'
import type { BranchInput } from '@/schemas/branch-schema'

const KEY = ['branches']

export function useBranches() {
  return useQuery({ queryKey: KEY, queryFn: branchService.list })
}

export function useBranch(id: string | undefined) {
  return useQuery({
    queryKey: ['branches', id],
    queryFn: () => branchService.get(id!),
    enabled: !!id,
  })
}

export function useBranchMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: KEY })

  const create = useMutation({
    mutationFn: (input: BranchInput) => branchService.create(input),
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<BranchInput> }) =>
      branchService.update(id, input),
    onSuccess: invalidate,
  })
  const setArchived = useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) =>
      branchService.setArchived(id, archived),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (id: string) => branchService.remove(id),
    onSuccess: invalidate,
  })

  return { create, update, setArchived, remove }
}
