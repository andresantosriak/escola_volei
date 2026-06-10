import { useMemo, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ChevronLeft, Check, ArrowRight, ChevronDown, ChevronUp, Home } from 'lucide-react'
import { FullPageSpinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { Avatar } from '@/components/students/Avatar'
import { Scale5 } from '@/components/students/Scale5'
import { useTraining } from '@/contexts/training-context'
import { useSkillsConfig } from '@/hooks/use-skills-config'
import { useEvaluationMutations } from '@/hooks/use-evaluations'

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

  const [currentIdx, setCurrentIdx] = useState(0)
  const [drafts, setDrafts] = useState<Record<string, DraftState>>({})
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [expandSoft, setExpandSoft] = useState(false)

  const technical = useMemo(
    () => (skillConfigs ?? []).filter((s) => s.kind === 'technical' && s.active),
    [skillConfigs],
  )
  const soft = useMemo(
    () => (skillConfigs ?? []).filter((s) => s.kind === 'soft' && s.active),
    [skillConfigs],
  )

  if (!sessionId || present.length === 0) return <Navigate to="/" replace />
  if (isLoading) return <FullPageSpinner label="Carregando fundamentos..." />

  const player = present[currentIdx]
  if (!player) return <Navigate to="/" replace />

  const getDraft = (id: string): DraftState => {
    if (drafts[id]) return drafts[id]
    const p = present.find((x) => x.id === id)
    const skills: Record<string, number> = {}
    for (const sc of [...technical, ...soft]) {
      skills[sc.key] = p?.skills[sc.key] ?? 3
    }
    // engagement default 3 (neutro) — alinhado ao DEFAULT do banco e ao CHECK 1..5.
    // (era 0, que violava evaluations_engagement_check ao salvar sem tocar na nota.)
    return { engagement: 3, notes: '', skills }
  }

  const patchDraft = (id: string, patch: Partial<DraftState>) =>
    setDrafts((prev) => ({ ...prev, [id]: { ...getDraft(id), ...patch } }))

  const d = getDraft(player.id)
  const origLevel = (key: string) => player.skills[key] ?? 3
  const hasNext = currentIdx < present.length - 1 && present.some((p, i) => i > currentIdx && !saved.has(p.id))
  const allSaved = present.length > 0 && present.every((p) => saved.has(p.id))

  const saveOne = async (advance: boolean) => {
    try {
      await save.mutateAsync({
        sessionId,
        studentId: player.id,
        engagement: d.engagement,
        notes: d.notes,
        skills: Object.entries(d.skills).map(([skill_key, value]) => ({
          skill_key,
          value,
          previous: player.skills[skill_key] ?? 3,
        })),
      })
      setSaved((prev) => new Set(prev).add(player.id))
      toast.success(`${player.name.split(' ')[0]} avaliado!`)
      if (advance) {
        const nextUnsaved = present.findIndex((p, i) => i > currentIdx && !saved.has(p.id))
        if (nextUnsaved >= 0) {
          setCurrentIdx(nextUnsaved)
          setExpandSoft(false)
        }
      }
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  // Context label like the UI kit: "Treino de Ter · 27 mai · Sub-17 Masculino"
  const ctxLabel = teamName ?? ''

  return (
    <div className="flex min-h-dvh flex-col bg-app">
      {/* ---- Header: back + avatar + name/context ---- */}
      <header className="bg-app px-[18px] pb-3 pt-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/training/result')}
            className="flex size-[40px] shrink-0 items-center justify-center rounded-full text-fg-2 hover:bg-sunken"
            aria-label="Voltar"
          >
            <ChevronLeft size={22} />
          </button>
          <Avatar name={player.name} size={42} ring={saved.has(player.id) ? 'var(--color-green-500)' : undefined} />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[19px] font-extrabold leading-tight text-fg-1">
              {player.name.split(' ')[0]} {player.name.split(' ')[1] || ''}
            </h1>
            {ctxLabel && (
              <p className="mt-0.5 font-body text-[13px] font-medium text-fg-3">{ctxLabel}</p>
            )}
          </div>
        </div>
      </header>

      {/* ---- Body ---- */}
      <div className="flex-1 overflow-auto px-[18px] pb-[calc(var(--bottom-nav-h)+150px)] pt-1">
        {/* Fundamentos tecnicos */}
        <div className="mb-2 flex items-baseline justify-between">
          <span className="font-display text-[13px] font-extrabold text-fg-1">
            Fundamentos t&eacute;cnicos
          </span>
          <span className="shrink-0 font-body text-[11px] font-semibold text-fg-4">
            ajuste de n&iacute;vel &middot; est&aacute;vel
          </span>
        </div>

        {technical.length > 0 && (
          <div className="rounded-[18px] bg-surface shadow-sm" style={{ padding: '4px 14px' }}>
            {technical.map((sc, i) => {
              const v = d.skills[sc.key] ?? 3
              const base = origLevel(sc.key)
              const changed = v !== base
              return (
                <div
                  key={sc.id}
                  style={i > 0 ? { borderTop: '1px solid var(--color-border-1)', padding: '11px 0' } : { padding: '11px 0' }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-body text-[14.5px] font-semibold text-fg-1">{sc.label}</span>
                    {changed && (
                      <span
                        className="font-body text-[10.5px] font-bold"
                        style={{
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: v > base ? 'var(--color-win-bg)' : 'var(--color-loss-bg)',
                          color: v > base ? 'var(--color-win-700)' : 'var(--color-loss-700)',
                        }}
                      >
                        {v > base ? '↑' : '↓'} de {base}
                      </span>
                    )}
                  </div>
                  <Scale5
                    value={v}
                    onChange={(n) =>
                      patchDraft(player.id, { skills: { ...d.skills, [sc.key]: n } })
                    }
                  />
                </div>
              )
            })}
          </div>
        )}

        <p className="mx-0.5 mt-2 font-body text-[11.5px] text-fg-4">
          Padr&atilde;o = sem altera&ccedil;&atilde;o. S&oacute; o que voc&ecirc; mexer vira ajuste — e alimenta o balanceamento dos times.
        </p>

        {/* Engajamento do dia */}
        <div className="mb-2 mt-5 flex items-baseline justify-between">
          <span className="font-display text-[13px] font-extrabold text-fg-1">Engajamento do dia</span>
          <span className="font-body text-[11px] font-semibold text-fg-4">
            vol&aacute;til &middot; vira o ENGAJ.
          </span>
        </div>

        <div className="rounded-[18px] bg-surface p-[14px] shadow-sm">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="font-body text-[14.5px] font-semibold text-fg-1">Nota geral do dia</span>
            {soft.length > 0 && (
              <button
                type="button"
                onClick={() => setExpandSoft((e) => !e)}
                className="flex items-center gap-1 font-body text-[12.5px] font-bold text-green-600"
              >
                {expandSoft ? 'Recolher' : 'Detalhar'}
                {expandSoft ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
            )}
          </div>
          <Scale5 value={d.engagement} onChange={(v) => patchDraft(player.id, { engagement: v })} />

          {expandSoft && soft.length > 0 && (
            <div className="mt-3.5 flex flex-col gap-3 border-t border-border-1 pt-3">
              {soft.map((sc) => (
                <div key={sc.id} className="flex items-center justify-between gap-2.5">
                  <span className="font-body text-[13px] font-semibold text-fg-2">{sc.label}</span>
                  <Scale5
                    value={d.skills[sc.key] ?? 0}
                    onChange={(v) =>
                      patchDraft(player.id, { skills: { ...d.skills, [sc.key]: v } })
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Observacao */}
        <div className="mb-2 mt-5 font-body text-[11px] font-bold uppercase tracking-wider text-fg-3">
          Observa&ccedil;&atilde;o do dia &middot; opcional
        </div>
        <Textarea
          placeholder={"Ex.: boa evolução na recepção hoje"}
          rows={2}
          value={d.notes}
          onChange={(e) => patchDraft(player.id, { notes: e.target.value })}
        />
      </div>

      {/* ---- Bottom dock ---- */}
      <div className="fixed inset-x-0 bottom-[var(--bottom-nav-h)] z-30 mx-auto max-w-[440px] border-t border-border-1 bg-surface/95 p-4 pb-4 backdrop-blur">
        {allSaved ? (
          <Button size="lg" full onClick={() => { reset(); navigate('/') }}>
            <Home size={18} />
            Concluir — voltar ao in&iacute;cio
          </Button>
        ) : hasNext ? (
          <div className="flex gap-2.5">
            <Button variant="secondary" full onClick={() => saveOne(false)} disabled={save.isPending}>
              <Check size={18} />
              Salvar
            </Button>
            <Button full onClick={() => saveOne(true)} disabled={save.isPending}>
              Salvar e pr&oacute;ximo
              <ArrowRight size={18} />
            </Button>
          </div>
        ) : (
          <Button size="lg" full onClick={() => saveOne(false)} disabled={save.isPending}>
            <Check size={18} />
            Salvar avalia&ccedil;&atilde;o
          </Button>
        )}
      </div>
    </div>
  )
}
