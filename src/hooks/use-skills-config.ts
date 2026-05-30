import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { skillsConfigService } from '@/services/skills-config-service'
import type { SkillConfig } from '@/types/domain'

export function useSkillsConfig() {
  return useQuery({ queryKey: ['skill_configs'], queryFn: skillsConfigService.list })
}

export function useActiveTechnicalSkills() {
  const query = useSkillsConfig()
  return {
    ...query,
    data: query.data?.filter((s) => s.kind === 'technical' && s.active),
  }
}

export function useSkillsConfigMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['skill_configs'] })

  const create = useMutation({
    mutationFn: (input: { label: string; kind: 'technical' | 'soft'; sort_order: number }) =>
      skillsConfigService.create(input),
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<SkillConfig> }) =>
      skillsConfigService.update(id, patch),
    onSuccess: invalidate,
  })

  return { create, update }
}
