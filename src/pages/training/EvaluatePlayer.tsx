import { useMemo, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ChevronDown, ChevronUp, Minus, Check } from 'lucide-react'
import { Header } from '@/components/layouts/Header'
import { FullPageSpinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { Avatar } from '@/components/students/Avatar'
import { Scale5 } from '@/components/students/Scale5'
import { useTraining } from '@/contexts/training-context'
import { useSkillsConfig } from '@/hooks/use-skills-config'
import { useEvaluationMutations } from '@/hooks/use-evaluations'
import { cn } from '@/lib/utils'

interface DraftState {
  engagement: number
  notes: string
  skills: Record<string, number>
}

export default function EvaluatePlayer() {
  const navigate = useNavigate()
  const { sessionId, present, teamName, reset } = useTraining()
  const { data: skillConfigs, isLoading } = useSkillsConfig()
  const { save } = useEvaluationMutations()

  const [openId, setOpenId] = useState<string | null>(present[0]?.id ?? null)
  const [drafts, setDrafts] = useState<Record<string, DraftState>>({})
  const [saved, setSaved] = useState<Set<string>>(new Set())

  const technical = useMemo(
    () => (skillConfigs ?? []).filter((s) => s.kind === 'technical' && s.active),
    [skillConfigs],
  )
  const soft = useMemo(
    () => (skillConfigs ?? []).filter((s) => s.kind === 'soft' && s.active),
    [skillConfigs],
  )

  if (!sessionId || present.length === 0) return <Navigate to="/" replace />
  if (isLoading) return <FullPageSpinner label="Carregando fundamentos…" />

  const getDraft = (id: string): DraftState => {
    if (drafts[id]) return drafts[id]
    const player = present.find((p) => p.id === id)
    const skills: Record<string, number> = {}
    for (const sc of [...technical, ...soft]) {
      skills[sc.key] = player?.skills[sc.key] ?? 3
    }
    return { engagement: 3, notes: '', skills }
  }

  const patchDraft = (id: string, patch: Partial<DraftState>) =>
    setDrafts((prev) => ({ ...prev, [id]: { ...getDraft(id), ...patch } }))

  const adjustSkill = (id: string, key: string, delta: number) => {
    const d = getDraft(id)
    const next = Math.max(1, Math.min(5, (d.skills[key] ?? 3) + delta))
    patchDraft(id, { skills: { ...d.skills, [key]: next } })
  }

  const saveOne = async (id: string, advance: boolean) => {
    const d = getDraft(id)
    const player = present.find((p) => p.id === id)!
    try {
      await save.mutateAsync({
        sessionId,
        studentId: id,
        engagement: d.engagement,
        notes: d.notes,
        skills: Object.entries(d.skills).map(([skill_key, value]) => ({
          skill_key,
          value,
          previous: player.skills[skill_key] ?? 3,
        })),
      })
      setSaved((prev) => new Set(prev).add(id))
      toast.success(`${player.name.split(' ')[0]} avaliado!`)
      if (advance) {
        const idx = present.findIndex((p) => p.id === id)
        const next = present[idx + 1]
        setOpenId(next?.id ?? null)
      }
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const finish = () => {
    reset()
    navigate('/history', { replace: true })
  }

  return (
    <>
      <Header
        title="Avaliação do treino"
        subtitle={teamName ?? undefined}
        onBack={() => navigate('/training/result')}
        right={
          <span className="rounded-full bg-green-50 px-2.5 py-1 font-stat text-sm font-bold text-green-700">
            {saved.size}/{present.length}
          </span>
        }
      />
      <div className="space-y-2.5 p-4 pb-28">
        {present.map((player) => {
          const open = openId === player.id
          const d = getDraft(player.id)
          const isSaved = saved.has(player.id)
          return (
            <div key={player.id} className="overflow-hidden rounded-lg border border-border-1 bg-surface">
              <button
                onClick={() => setOpenId(open ? null : player.id)}
                className="flex w-full items-center gap-3 px-3.5 py-3 text-left"
              >
                <Avatar name={player.name} size={36} ring={isSaved ? 'var(--color-green-500)' : undefined} />
                <span className="flex-1 truncate font-body text-sm font-semibold">{player.name}</span>
                {isSaved && <Check size={16} className="text-green-500" />}
                {open ? <ChevronUp size={18} className="text-fg-3" /> : <ChevronDown size={18} className="text-fg-3" />}
              </button>

              {open && (
                <div className="space-y-4 border-t border-border-1 p-3.5">
                  <div>
                    <p className="mb-1.5 font-body text-xs font-semibold text-fg-3">Engajamento no treino</p>
                    <Scale5 value={d.engagement} onChange={(v) => patchDraft(player.id, { engagement: v })} />
                  </div>

                  {technical.length > 0 && (
                    <div>
                      <p className="mb-2 font-body text-xs font-semibold text-fg-3">Fundamentos técnicos</p>
                      <div className="flex flex-col gap-2">
                        {technical.map((sc) => {
                          const current = d.skills[sc.key] ?? 3
                          const base = player.skills[sc.key] ?? 3
                          const dir = current > base ? 'up' : current < base ? 'down' : 'stable'
                          return (
                            <div key={sc.id} className="flex items-center gap-2">
                              <span className="w-28 shrink-0 truncate font-body text-sm">{sc.label}</span>
                              <button
                                onClick={() => adjustSkill(player.id, sc.key, -1)}
                                className="flex size-8 items-center justify-center rounded-full bg-sunken disabled:opacity-40"
                                disabled={current <= 1}
                                aria-label="Diminuir"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="w-5 text-center font-stat text-base font-bold tabular-nums">{current}</span>
                              <button
                                onClick={() => adjustSkill(player.id, sc.key, 1)}
                                className="flex size-8 items-center justify-center rounded-full bg-green-500 text-white disabled:opacity-40"
                                disabled={current >= 5}
                                aria-label="Aumentar"
                              >
                                +
                              </button>
                              <span
                                className={cn(
                                  'ml-auto rounded px-1.5 py-0.5 text-[10px] font-bold',
                                  dir === 'up' && 'bg-green-50 text-green-700',
                                  dir === 'down' && 'bg-[#FDEAEA] text-[#B4282D]',
                                  dir === 'stable' && 'text-fg-4',
                                )}
                              >
                                {dir === 'up' ? '▲' : dir === 'down' ? '▼' : '='}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {soft.length > 0 && (
                    <div>
                      <p className="mb-2 font-body text-xs font-semibold text-fg-3">Comportamental</p>
                      <div className="flex flex-col gap-2.5">
                        {soft.map((sc) => (
                          <div key={sc.id}>
                            <p className="mb-1 font-body text-xs text-fg-2">{sc.label}</p>
                            <Scale5
                              value={d.skills[sc.key] ?? 3}
                              onChange={(v) => patchDraft(player.id, { skills: { ...d.skills, [sc.key]: v } })}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="mb-1.5 font-body text-xs font-semibold text-fg-3">Observação</p>
                    <Textarea
                      placeholder="Anotações sobre o treino…"
                      value={d.notes}
                      onChange={(e) => patchDraft(player.id, { notes: e.target.value })}
                    />
                  </div>

                  <Button full onClick={() => saveOne(player.id, true)} disabled={save.isPending}>
                    Salvar e próximo
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[440px] border-t border-border-1 bg-surface/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur">
        <Button size="lg" full variant={saved.size > 0 ? 'primary' : 'secondary'} onClick={finish}>
          {saved.size > 0 ? 'Concluir treino' : 'Pular avaliação'}
        </Button>
      </div>
    </>
  )
}
