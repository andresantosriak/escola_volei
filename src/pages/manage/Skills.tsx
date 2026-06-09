import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { GripVertical, Info, Plus } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { ScreenHeader } from '@/components/layouts/ScreenHeader'
import { FullPageSpinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Sheet } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Segmented } from '@/components/ui/tabs'
import { useSkillsConfig, useSkillsConfigMutations } from '@/hooks/use-skills-config'
import { useSettings, useSettingsMutations } from '@/hooks/use-settings'
import { skillsConfigService } from '@/services/skills-config-service'
import type { SkillConfig } from '@/types/domain'

export default function Skills() {
  const { data: skills, isLoading } = useSkillsConfig()
  const { create, update } = useSkillsConfigMutations()
  const { data: settings, isLoading: settingsLoading } = useSettings()
  const { update: updateSettings } = useSettingsMutations()
  const qc = useQueryClient()

  const showWeights = settings?.show_weights ?? false

  /* ── Local draft state for weight sliders (smooth drag) ── */
  const [weightDraft, setWeightDraft] = useState<Record<string, number>>({})
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  useEffect(() => () => Object.values(saveTimers.current).forEach(clearTimeout), [])
  const weightOf = (s: SkillConfig) => weightDraft[s.id] ?? Number(s.weight)

  const [addOpen, setAddOpen] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newKind, setNewKind] = useState<'technical' | 'soft'>('technical')

  const technical = useMemo(() => (skills ?? []).filter((s) => s.kind === 'technical'), [skills])
  const soft = useMemo(() => (skills ?? []).filter((s) => s.kind === 'soft'), [skills])

  if (isLoading || settingsLoading) return <FullPageSpinner label="Carregando fundamentos..." />

  const toggleActive = (s: SkillConfig) => {
    const sameKindActive = (s.kind === 'technical' ? technical : soft).filter((x) => x.active)
    if (s.active && sameKindActive.length <= 1) {
      toast.error('Mantenha ao menos um fundamento ativo nesta categoria.')
      return
    }
    update.mutate({ id: s.id, patch: { active: !s.active } })
  }

  const changeWeight = (s: SkillConfig, weight: number) => {
    setWeightDraft((prev) => ({ ...prev, [s.id]: weight }))
    clearTimeout(saveTimers.current[s.id])
    saveTimers.current[s.id] = setTimeout(
      () => update.mutate({ id: s.id, patch: { weight } }),
      350,
    )
  }

  const move = async (list: SkillConfig[], idx: number, dir: -1 | 1) => {
    const target = idx + dir
    if (target < 0 || target >= list.length) return
    const a = list[idx]
    const b = list[target]
    await skillsConfigService.update(a.id, { sort_order: b.sort_order })
    await skillsConfigService.update(b.id, { sort_order: a.sort_order })
    qc.invalidateQueries({ queryKey: ['skill_configs'] })
  }

  const addSkill = async () => {
    if (newLabel.trim().length < 2) {
      toast.error('Informe um nome válido.')
      return
    }
    const list = newKind === 'technical' ? technical : soft
    const maxOrder = list.reduce((m, s) => Math.max(m, s.sort_order), 0)
    try {
      await create.mutateAsync({ label: newLabel.trim(), kind: newKind, sort_order: maxOrder + 1 })
      toast.success('Fundamento adicionado!')
      setAddOpen(false)
      setNewLabel('')
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const renderRow = (s: SkillConfig, list: SkillConfig[], idx: number) => (
    <div
      key={s.id}
      className="bg-surface px-[14px] py-3"
      style={{ borderTop: idx > 0 ? '1px solid var(--border-1)' : undefined }}
    >
      <div className="flex items-center gap-3">
        {/* Drag handle */}
        <button
          type="button"
          className="shrink-0 text-fg-4 active:text-fg-3"
          aria-label="Reordenar"
          onClick={() => move(list, idx, idx > 0 ? -1 : 1)}
        >
          <GripVertical size={18} />
        </button>

        {/* Label */}
        <span
          className={
            'flex-1 font-body text-[15px] font-semibold ' +
            (s.active ? 'text-fg-1' : 'text-fg-4 italic')
          }
        >
          {s.label}
        </span>

        {/* Weight badge */}
        {showWeights && s.active && (
          <span className="rounded-full bg-green-50 px-2 py-0.5 font-body text-[11px] font-bold text-green-600">
            x{weightOf(s).toFixed(1)}
          </span>
        )}

        {/* Toggle switch */}
        <Switch
          checked={s.active}
          onCheckedChange={() => toggleActive(s)}
          aria-label={`Ativar ${s.label}`}
        />
      </div>

      {/* Inline weight slider (only when showWeights is on and skill is active) */}
      {showWeights && s.active && (
        <div className="mt-2 flex items-center gap-2 pl-[30px]">
          <span className="font-body text-[11px] text-fg-3">Peso</span>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={weightOf(s)}
            onChange={(e) => changeWeight(s, Number(e.target.value))}
            aria-label={`Peso do fundamento ${s.label}`}
            className="flex-1 accent-green-500"
          />
          <span className="w-8 text-right font-num text-[13px] font-bold tabular-nums">
            {weightOf(s).toFixed(1)}
          </span>
        </div>
      )}
    </div>
  )

  const renderSection = (title: string, list: SkillConfig[], showWeightToggle?: boolean) => (
    <div>
      <div className="mb-[9px] mt-[22px] flex items-center justify-between px-1">
        <span className="font-body text-[11px] font-bold uppercase tracking-[0.05em] text-fg-3">
          {title}
        </span>
        {showWeightToggle && (
          <span className="flex items-center gap-[7px] font-body text-[11.5px] font-semibold text-fg-3">
            <span className="text-right leading-tight">
              Mostrar<br />pesos
            </span>
            <Switch
              checked={showWeights}
              onCheckedChange={(v) => updateSettings.mutate({ show_weights: v })}
              aria-label="Mostrar pesos"
            />
          </span>
        )}
      </div>
      <div className="overflow-hidden rounded-[14px] shadow-sm">
        {list.map((s, idx) => renderRow(s, list, idx))}
      </div>
    </div>
  )

  return (
    <>
      <ScreenHeader
        title="Fundamentos"
        subtitle="Configurar avaliação"
        back
      />

      <div className="space-y-0 px-[18px] pb-[calc(var(--bottom-nav-h)+24px)] pt-1">
        {/* Info card */}
        <div className="mb-[6px] flex gap-[10px] rounded-[14px] bg-surface p-[13px_15px] shadow-sm">
          <Info size={18} className="mt-0.5 shrink-0 text-green-600" />
          <p className="font-body text-[12.5px] leading-[1.4] text-fg-2">
            Define o que aparece na <b>Avaliação rápida</b> e o que entra no cálculo de{' '}
            <b>equilíbrio dos times</b>.
          </p>
        </div>

        {/* Technical skills */}
        {renderSection('Técnicos', technical, true)}

        {/* Soft skills */}
        {renderSection('Comportamentais', soft)}

        {/* Bottom CTA */}
        <div className="mt-4">
          <Button full variant="secondary" onClick={() => setAddOpen(true)}>
            <Plus size={18} />
            Adicionar fundamento
          </Button>
        </div>

        <p className="mt-3 text-center font-body text-[11.5px] text-fg-4">
          Ao menos um fundamento precisa permanecer ativo.
        </p>
      </div>

      {/* Sheet: add new skill */}
      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Novo fundamento">
        <div className="mb-3">
          <p className="mb-1.5 font-body text-xs font-semibold text-fg-3">Categoria</p>
          <Segmented
            value={newKind}
            onChange={(v) => setNewKind(v as 'technical' | 'soft')}
            options={[
              { value: 'technical', label: 'Técnico' },
              { value: 'soft', label: 'Comportamental' },
            ]}
          />
        </div>
        <div className="mb-4">
          <p className="mb-1.5 font-body text-xs font-semibold text-fg-3">Nome</p>
          <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Ex: Saque viagem" />
        </div>
        <Button full onClick={addSkill} disabled={create.isPending}>
          Adicionar
        </Button>
      </Sheet>

    </>
  )
}
