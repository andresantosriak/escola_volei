import { useMemo, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Minus, X, Check } from 'lucide-react'
import { ScreenHeader } from '@/components/layouts/ScreenHeader'
import { Button } from '@/components/ui/button'
import { Segmented } from '@/components/ui/tabs'
import { useTraining } from '@/contexts/training-context'
import { useMatchMutations } from '@/hooks/use-matches'
import { MATCH_FORMATS } from '@/lib/constants'
import { computeWinner, setsWon, type MatchSetInput } from '@/schemas/match-schema'
import type { MatchFormat } from '@/lib/constants'

const FORMAT_OPTIONS = (Object.keys(MATCH_FORMATS) as MatchFormat[]).map((k) => ({
  value: k,
  label: MATCH_FORMATS[k],
}))

/** How many sets each format starts with */
const FORMAT_SET_COUNT: Record<MatchFormat, number> = {
  single: 1,
  best_of_3: 3,
  best_of_5: 5,
  timed: 1,
}

type WinnerOption = 'auto' | 'a' | 'b' | 'wo_a' | 'wo_b'

export default function RegisterResult() {
  const navigate = useNavigate()
  const { teamId, sessionId, result, reset } = useTraining()
  const { create } = useMatchMutations()

  const [format, setFormat] = useState<MatchFormat>('best_of_3')
  const [sets, setSets] = useState<MatchSetInput[]>([
    { points_a: 0, points_b: 0 },
    { points_a: 0, points_b: 0 },
    { points_a: 0, points_b: 0 },
  ])
  const [winnerOption, setWinnerOption] = useState<WinnerOption>('auto')
  const [nameA, setNameA] = useState('Furacão')
  const [nameB, setNameB] = useState('Tubarões')

  const autoWinner = useMemo(() => computeWinner(sets), [sets])
  const tally = useMemo(() => setsWon(sets), [sets])

  const walkover = winnerOption === 'wo_a' || winnerOption === 'wo_b'
  const manualWinner =
    winnerOption === 'a' || winnerOption === 'wo_a'
      ? 'a'
      : winnerOption === 'b' || winnerOption === 'wo_b'
        ? 'b'
        : null
  const winner = winnerOption === 'auto' ? autoWinner : manualWinner
  const tied = !walkover && autoWinner === null && winnerOption === 'auto'

  if (!teamId) return <Navigate to="/" replace />

  const updateSet = (i: number, patch: Partial<MatchSetInput>) =>
    setSets((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))

  const removeSet = (i: number) =>
    setSets((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev))

  const changeFormat = (v: string) => {
    const f = v as MatchFormat
    setFormat(f)
    const n = FORMAT_SET_COUNT[f]
    setSets((prev) => {
      const arr = prev.slice(0, n)
      while (arr.length < n) arr.push({ points_a: 0, points_b: 0 })
      return arr
    })
  }

  const canSave = (walkover || !tied) && winner !== null

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
          team_a_name: nameA,
          team_b_name: nameB,
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
        const n = FORMAT_SET_COUNT[format]
        const fresh: MatchSetInput[] = []
        for (let i = 0; i < n; i++) fresh.push({ points_a: 0, points_b: 0 })
        setSets(fresh)
        setWinnerOption('auto')
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

  const winnerLabels: { value: WinnerOption; label: string }[] = [
    { value: 'auto', label: 'Automático' },
    { value: 'a', label: nameA },
    { value: 'b', label: nameB },
    { value: 'wo_a', label: 'W.O. A' },
    { value: 'wo_b', label: 'W.O. B' },
  ]

  const helperText = walkover
    ? 'Vitória por W.O. (sem placar completo).'
    : winnerOption !== 'auto'
      ? 'Vencedor definido manualmente.'
      : autoWinner
        ? 'Vencedor calculado pelos sets ganhos — ajuste se precisar.'
        : 'Digite os sets ou escolha o vencedor manualmente.'

  return (
    <>
      <ScreenHeader
        title="Registrar resultado"
        back
        onBack={() => navigate('/training/teams')}
      />

      <div className="space-y-0 px-[18px] pb-[200px]">
        {/* ---- Score banner ---- */}
        <div
          className="flex items-center justify-between gap-2 rounded-[18px] bg-surface px-4 py-[14px] shadow-sm"
        >
          <input
            value={nameA}
            onChange={(e) => setNameA(e.target.value)}
            spellCheck={false}
            className="min-w-0 flex-1 border-0 border-b-[1.5px] border-dashed border-border-2 bg-transparent pb-0.5 font-display text-base font-extrabold text-fg-1 outline-none"
            style={{ color: winner === 'a' ? 'var(--color-win-700)' : undefined }}
          />
          <div
            className="shrink-0 px-3 font-num font-black tabular-nums leading-none"
            style={{ fontSize: 30, letterSpacing: '-0.02em' }}
          >
            <span style={winner === 'a' ? { color: 'var(--color-win-700)' } : undefined}>{tally.a}</span>
            <span className="text-fg-4" style={{ fontSize: 18 }}> x </span>
            <span style={winner === 'b' ? { color: 'var(--color-win-700)' } : undefined}>{tally.b}</span>
          </div>
          <input
            value={nameB}
            onChange={(e) => setNameB(e.target.value)}
            spellCheck={false}
            className="min-w-0 flex-1 border-0 border-b-[1.5px] border-dashed border-border-2 bg-transparent pb-0.5 text-right font-display text-base font-extrabold text-fg-1 outline-none"
            style={{ color: winner === 'b' ? 'var(--color-win-700)' : undefined }}
          />
        </div>

        {/* ---- Formato ---- */}
        <div className="pt-[22px]">
          <p className="mb-[9px] px-1 font-body text-[11px] font-bold uppercase tracking-[0.05em] text-fg-3">
            Formato
          </p>
          <Segmented
            value={format}
            onChange={changeFormat}
            options={FORMAT_OPTIONS}
          />
        </div>

        {/* ---- Placar por set ---- */}
        <div className="pt-[22px]">
          <p className="mb-[9px] px-1 font-body text-[11px] font-bold uppercase tracking-[0.05em] text-fg-3">
            Placar por set
          </p>
          <div className="rounded-[18px] bg-surface px-[14px] py-[6px] shadow-sm">
            {sets.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-2 py-[10px]"
                style={i > 0 ? { borderTop: '1px solid var(--border-1)' } : undefined}
              >
                <span className="w-[44px] font-body text-[11px] font-bold uppercase tracking-[0.04em] text-fg-4">
                  SET {i + 1}
                </span>

                {/* Score step A */}
                <ScoreStepInline
                  value={s.points_a}
                  win={s.points_a > s.points_b && (s.points_a !== 0 || s.points_b !== 0)}
                  onChange={(v) => updateSet(i, { points_a: v })}
                />

                <span className="text-fg-4 font-semibold">x</span>

                {/* Score step B */}
                <ScoreStepInline
                  value={s.points_b}
                  win={s.points_b > s.points_a && (s.points_a !== 0 || s.points_b !== 0)}
                  onChange={(v) => updateSet(i, { points_b: v })}
                />

                <button
                  type="button"
                  onClick={() => removeSet(i)}
                  className="ml-auto flex size-[34px] shrink-0 items-center justify-center rounded-lg text-fg-4 active:scale-90"
                  aria-label="Remover set"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ---- Adicionar set ---- */}
        <div className="pt-[10px]">
          <button
            type="button"
            disabled={sets.length >= 5}
            onClick={() => setSets((prev) => [...prev, { points_a: 0, points_b: 0 }])}
            className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-surface px-[18px] py-[14px] font-display text-[15px] font-bold text-fg-2 shadow-sm transition-all active:scale-[0.97] disabled:text-fg-4 disabled:pointer-events-none"
          >
            <Plus size={18} /> {sets.length >= 5 ? 'Máximo de 5 sets' : 'Adicionar set'}
          </button>
        </div>

        {/* ---- Vencedor ---- */}
        <div className="pt-[22px]">
          <p className="mb-[9px] px-1 font-body text-[11px] font-bold uppercase tracking-[0.05em] text-fg-3">
            Vencedor
          </p>
          <div className="flex flex-wrap gap-2">
            {winnerLabels.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setWinnerOption(opt.value)}
                className="rounded-full border-0 px-[14px] py-2 font-body text-[13px] font-bold transition-colors"
                style={{
                  background:
                    winnerOption === opt.value ? 'var(--color-green-500)' : 'var(--surface)',
                  color: winnerOption === opt.value ? '#fff' : 'var(--fg-2)',
                  boxShadow: winnerOption === opt.value ? 'none' : 'var(--shadow-sm)',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="mt-[10px] px-0.5 font-body text-[11.5px] text-fg-4">
            {helperText}
          </p>
        </div>
      </div>

      {/* ---- Dock ---- */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[440px] flex-col gap-[10px] bg-surface/95 px-[18px] pt-[14px] pb-[calc(14px+env(safe-area-inset-bottom))] backdrop-blur">
        <Button
          full
          size="lg"
          disabled={!canSave || create.isPending}
          onClick={() => save(false)}
        >
          <Check size={20} /> {canSave ? 'Salvar resultado' : 'Defina o vencedor'}
        </Button>
        <button
          type="button"
          disabled={!canSave || create.isPending}
          onClick={() => save(true)}
          className="flex w-full items-center justify-center gap-2 rounded-[14px] px-[18px] py-3 font-display text-[15px] font-bold text-fg-2 transition-all active:scale-[0.97] disabled:text-fg-4 disabled:pointer-events-none"
        >
          <Plus size={18} /> Salvar e registrar outra partida
        </button>
      </div>
    </>
  )
}

/* ---------- ScoreStepInline (matches er-score-step from DS) ---------- */
interface ScoreStepInlineProps {
  value: number
  win: boolean
  onChange: (v: number) => void
}

function ScoreStepInline({ value, win, onChange }: ScoreStepInlineProps) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-[12px] p-1"
      style={{
        background: win ? 'var(--color-green-50)' : 'var(--sunken)',
        border: win ? '2px solid var(--color-green-500)' : '2px solid transparent',
      }}
    >
      <button
        type="button"
        aria-label="Diminuir"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="flex size-[30px] items-center justify-center rounded-lg bg-surface text-green-600 shadow-sm active:scale-90"
      >
        <Minus size={16} />
      </button>
      <span
        className="w-[38px] text-center font-num font-black text-fg-1"
        style={{ fontSize: 21 }}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Aumentar"
        onClick={() => onChange(value + 1)}
        className="flex size-[30px] items-center justify-center rounded-lg bg-surface text-green-600 shadow-sm active:scale-90"
      >
        <Plus size={16} />
      </button>
    </div>
  )
}
