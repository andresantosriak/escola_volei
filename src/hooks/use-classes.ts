import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { classService } from '@/services/class-service'
import type { ClassInput } from '@/schemas/class-schema'

export function useClasses(branchId?: string) {
  return useQuery({
    queryKey: ['classes', { branchId: branchId ?? null }],
    queryFn: () => classService.list(branchId),
  })
}

export function useClass(id: string | undefined) {
  return useQuery({
    queryKey: ['classes', id],
    queryFn: () => classService.get(id!),
    enabled: !!id,
  })
}

export function useClassMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['classes'] })

  const create = useMutation({
    mutationFn: (input: ClassInput) => classService.create(input),
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ClassInput> }) =>
      classService.update(id, input),
    onSuccess: invalidate,
  })
  const setArchived = useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) =>
      classService.setArchived(id, archived),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (id: string) => classService.remove(id),
    onSuccess: invalidate,
  })

  return { create, update, setArchived, remove }
}
