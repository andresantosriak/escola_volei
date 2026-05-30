import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { studentService } from '@/services/student-service'
import type { StudentInput } from '@/schemas/student-schema'

export function useStudents(teamId?: string) {
  return useQuery({
    queryKey: ['students', { teamId: teamId ?? null }],
    queryFn: () => studentService.listByTeam(teamId),
  })
}

export function useStudent(id: string | undefined) {
  return useQuery({
    queryKey: ['students', id],
    queryFn: () => studentService.get(id!),
    enabled: !!id,
  })
}

export function useTeamRoster(teamId: string | undefined) {
  return useQuery({
    queryKey: ['roster', teamId],
    queryFn: () => studentService.roster(teamId!),
    enabled: !!teamId,
  })
}

export function useStudentMutations() {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['students'] })
    qc.invalidateQueries({ queryKey: ['roster'] })
  }

  const create = useMutation({
    mutationFn: (input: StudentInput) => studentService.create(input),
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: ({
      id,
      input,
      currentTeamIds,
    }: {
      id: string
      input: StudentInput
      currentTeamIds: string[]
    }) => studentService.update(id, input, currentTeamIds),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (id: string) => studentService.remove(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
