import { useMemo, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Trash2, RotateCcw, Check } from 'lucide-react'
import { Header } from '@/components/layouts/Header'
import { Button } from '@/components/ui/button'
import { Segmented } from '@/components/ui/tabs'
import { Stepper } from '@/components/training/Stepper'
import { useTraining } from '@/contexts/training-context'
import { useMatchMutations } from '@/hooks/use-matches'
import { MATCH_FORMATS } from '@/lib/constants'
import { computeWinner, setsWon, type MatchSetInput } from '@/schemas/match-schema'
import type { MatchFormat } from '@/lib/constants'

const FORMAT_OPTIONS = (Object.keys(MATCH_FORMATS) as MatchFormat[]).map((k) => ({
  value: k,
  label: MATCH_FORMATS[k],
}))

const TEAM_A = 'Time A'
const TEAM_B = 'Time B'

export default function RegisterResult() {
  const navigate = useNavigate()
  const { teamId, teamName, sessionId, result, reset } = useTraining()
  const { create } = useMatchMutations()

  const [format, setFormat] = useState<MatchFormat>('best_of_3')
  const [sets, setSets] = useState<MatchSetInput[]>([{ points_a: 0, points_b: 0 }])
  const [manualWinner, setManualWinner] = useState<'a' | 'b' | null>(null)
  const [walkover, setWalkover] = useState(false)

  const autoWinner = useMemo(() => computeWinner(sets), [sets])
  const tally = useMemo(() => setsWon(sets), [sets])
  const winner = manualWinner ?? autoWinner
  const tied = !walkover && autoWinner === null && manualWinner === null

  if (!teamId) return <Navigate to="/" replace />

  const updateSet = (i: number, patch: Partial<MatchSetInput>) =>
    setSets((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))

  const save = async (registerAnother: boolean) => {
    if (walkover && !manualWinner) {
      toast.error('W.O. exige selecionar o time vencedor.')
      return
    }
    if (tied) {
      toast.error('Há empate. Defina o vencedor manualmente ou ajuste os sets.')
      return
    }
    try {
      await create.mutateAsync({
        teamId,
        sessionId,
        input: {
          format,
          team_a_name: TEAM_A,
          team_b_name: TEAM_B,
          sets,
          winner: walkover ? manualWinner : winner,
          walkover,
        },
        balanceScore: result?.score ?? null,
        rosterA: result?.teamA.map((p) => p.id) ?? [],
        rosterB: result?.teamB.map((p) => p.id) ?? [],
      })
      toast.success('Resultado registrado!')
      if (registerAnother) {
        setSets([{ points_a: 0, points_b: 0 }])
        setManualWinner(null)
        setWalkover(false)
      } else if (sessionId && result) {
        navigate('/training/evaluate')
      } else {
        reset()
        navigate('/history', { replace: true })
      }
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <>
      <Header
        title="Registrar resultado"
        subtitle={teamName ?? undefined}
        onBack={() => navigate('/training/teams')}
      />
      <div className="space-y-4 p-4 pb-40">
        <div>
          <p className="mb-1.5 font-body text-xs font-semibold text-fg-3">Formato</p>
          <Segmented
            value={format}
            onChange={(v) => setFormat(v as MatchFormat)}
            options={FORMAT_OPTIONS.slice(0, 2)}
          />
          <div className="mt-2">
            <Segmented
              value={format}
              onChange={(v) => setFormat(v as MatchFormat)}
              options={FORMAT_OPTIONS.slice(2)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-sunken px-3 py-2 text-sm font-bold">
          <span className="flex-1 text-right text-[#F08C00]">{TEAM_A}</span>
          <span className="px-3 font-stat tabular-nums">
            {tally.a} × {tally.b}
          </span>
          <span className="flex-1 text-ink-600">{TEAM_B}</span>
        </div>

        {sets.map((s, i) => (
          <div key={i} className="rounded-lg border border-border-1 bg-surface p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-body text-xs font-semibold text-fg-3">Set {i + 1}</span>
              {sets.length > 1 && (
                <button
                  onClick={() => setSets((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-fg-4 hover:text-loss"
                  aria-label="Remover set"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between gap-2">
              <Stepper value={s.points_a} onChange={(v) => updateSet(i, { points_a: v })} max={99} />
              <span className="text-xs text-fg-4">×</span>
              <Stepper value={s.points_b} onChange={(v) => updateSet(i, { points_b: v })} max={99} />
            </div>
          </div>
        ))}

        <Button
          variant="secondary"
          full
          disabled={sets.length >= 5}
          onClick={() => setSets((prev) => [...prev, { points_a: 0, points_b: 0 }])}
        >
          <Plus size={18} /> {sets.length >= 5 ? 'Máximo de 5 sets' : 'Adicionar set'}
        </Button>

        <div className="rounded-lg border border-border-1 bg-surface p-3">
          <p className="mb-2 font-body text-xs font-semibold text-fg-3">Vencedor</p>
          <Segmented
            value={winner ?? ''}
            onChange={(v) => setManualWinner(v as 'a' | 'b')}
            options={[
              { value: 'a', label: TEAM_A },
              { value: 'b', label: TEAM_B },
            ]}
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-fg-3">
              {tied
                ? 'Empate — escolha o vencedor'
                : autoWinner && !manualWinner
                  ? 'Definido automaticamente'
                  : 'Definido manualmente'}
            </span>
            <button
              onClick={() => setWalkover((w) => !w)}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${walkover ? 'bg-[#FFF0DD] text-[#A85A00]' : 'bg-sunken text-fg-3'}`}
            >
              {walkover && <Check size={12} />} W.O.
            </button>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[440px] gap-2 border-t border-border-1 bg-surface/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur">
        <Button variant="secondary" full onClick={() => save(true)} disabled={create.isPending}>
          <RotateCcw size={18} /> Salvar e outra
        </Button>
        <Button full onClick={() => save(false)} disabled={create.isPending}>
          Salvar e finalizar
        </Button>
      </div>
    </>
  )
}
