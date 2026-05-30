import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsService, type SettingsUpdate } from '@/services/settings-service'

export function useSettings() {
  return useQuery({ queryKey: ['settings'], queryFn: settingsService.get })
}

export function useSettingsMutations() {
  const qc = useQueryClient()
  const update = useMutation({
    mutationFn: (patch: SettingsUpdate) => settingsService.update(patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  })
  return { update }
}
