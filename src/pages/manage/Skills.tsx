import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Plus, ChevronUp, ChevronDown } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Header } from '@/components/layouts/Header'
import { FullPageSpinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Sheet } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Segmented } from '@/components/ui/tabs'
import { useSkillsConfig, useSkillsConfigMutations } from '@/hooks/use-skills-config'
import { skillsConfigService } from '@/services/skills-config-service'
import type { SkillConfig } from '@/types/domain'

export default function Skills() {
  const { data: skills, isLoading } = useSkillsConfig()
  const { create, update } = useSkillsConfigMutations()
  const qc = useQueryClient()

  const [showWeights, setShowWeights] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newKind, setNewKind] = useState<'technical' | 'soft'>('technical')

  const technical = useMemo(() => (skills ?? []).filter((s) => s.kind === 'technical'), [skills])
  const soft = useMemo(() => (skills ?? []).filter((s) => s.kind === 'soft'), [skills])

  if (isLoading) return <FullPageSpinner label="Carregando fundamentos…" />

  const toggleActive = (s: SkillConfig) => {
    const sameKindActive = (s.kind === 'technical' ? technical : soft).filter((x) => x.active)
    if (s.active && sameKindActive.length <= 1) {
      toast.error('Mantenha ao menos um fundamento ativo nesta categoria.')
      return
    }
    update.mutate({ id: s.id, patch: { active: !s.active } })
  }

  const changeWeight = (s: SkillConfig, weight: number) =>
    update.mutate({ id: s.id, patch: { weight } })

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

  const renderSection = (title: string, list: SkillConfig[]) => (
    <div>
      <h3 className="mb-2 px-0.5 font-body text-sm font-bold text-fg-2">{title}</h3>
      <div className="flex flex-col gap-1.5">
        {list.map((s, idx) => (
          <div key={s.id} className="rounded-lg border border-border-1 bg-surface px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <button
                  onClick={() => move(list, idx, -1)}
                  disabled={idx === 0}
                  className="text-fg-4 disabled:opacity-30"
                  aria-label="Mover para cima"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => move(list, idx, 1)}
                  disabled={idx === list.length - 1}
                  className="text-fg-4 disabled:opacity-30"
                  aria-label="Mover para baixo"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
              <span className="flex-1 font-body text-sm font-semibold">{s.label}</span>
              <Switch
                checked={s.active}
                onCheckedChange={() => toggleActive(s)}
                aria-label={`Ativar ${s.label}`}
              />
            </div>
            {showWeights && s.active && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-fg-3">Peso</span>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={s.weight}
                  onChange={(e) => changeWeight(s, Number(e.target.value))}
                  className="flex-1 accent-green-500"
                />
                <span className="w-8 text-right font-stat text-sm font-bold tabular-nums">
                  {Number(s.weight).toFixed(1)}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <>
      <Header
        title="Fundamentos"
        back
        right={
          <Button size="sm" variant="ghost" onClick={() => setAddOpen(true)}>
            <Plus size={18} />
          </Button>
        }
      />
      <div className="space-y-5 p-4">
        <div className="flex items-center justify-between rounded-lg bg-sunken px-3 py-2.5">
          <span className="font-body text-sm font-semibold">Mostrar pesos (avançado)</span>
          <Switch checked={showWeights} onCheckedChange={setShowWeights} aria-label="Mostrar pesos" />
        </div>
        {renderSection('Técnicos', technical)}
        {renderSection('Comportamental', soft)}
        <p className="px-1 text-xs text-fg-4">
          Fundamentos técnicos ativos alimentam o cálculo do "Geral" e o balanceador de times. A
          chave interna de cada fundamento é imutável após a criação.
        </p>
      </div>

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
