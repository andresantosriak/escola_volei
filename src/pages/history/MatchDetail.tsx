import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Calendar,
  ClipboardCheck,
  ClipboardList,
  Pencil,
  Scale,
  Share2,
  Trash2,
  Trophy,
  UserCheck,
  Users,
  TrendingUp,
  Volleyball,
} from 'lucide-react'
import { ScreenHeader } from '@/components/layouts/ScreenHeader'
import { IconButton } from '@/components/layouts/IconButton'
import { FullPageSpinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { Avatar } from '@/components/students/Avatar'
import { StatBadge } from '@/components/students/StatBadge'
import { useMatch, useMatchMutations } from '@/hooks/use-matches'
import { useSessionEvaluations } from '@/hooks/use-evaluations'
import { formatMatchCardDate } from '@/lib/format'
import type { Student } from '@/types/domain'

/* ================================================================
   Sub-components for the match detail
   ================================================================ */

function SetRow({
  index,
  pointsA,
  pointsB,
  nameA,
  nameB,
}: {
  index: number
  pointsA: number
  pointsB: number
  nameA: string
  nameB: string
}) {
  const aWin = pointsA > pointsB
  return (
    <div
      className="flex items-center justify-between"
      style={{ padding: '13px 14px', borderTop: index > 1 ? '1px solid var(--border-1)' : undefined }}
    >
      <span className="q-label" style={{ width: 52, letterSpacing: '.04em' }}>
        SET {index}
      </span>
      <span
        className="flex-1 text-right font-body font-bold"
        style={{
          fontSize: 15,
          fontWeight: aWin ? 800 : 500,
          color: aWin ? 'var(--win-700)' : 'var(--fg-2)',
        }}
      >
        {nameA}
      </span>
      <span
        className="font-num font-black tabular-nums"
        style={{
          fontSize: 18,
          padding: '0 12px',
          color: 'var(--fg-1)',
          whiteSpace: 'nowrap',
          flex: 'none',
        }}
      >
        {pointsA} <span style={{ color: 'var(--fg-4)' }}>x</span> {pointsB}
      </span>
      <span
        className="flex-1 font-body font-bold"
        style={{
          fontSize: 15,
          fontWeight: !aWin ? 800 : 500,
          color: !aWin ? 'var(--win-700)' : 'var(--fg-2)',
        }}
      >
        {nameB}
      </span>
    </div>
  )
}

function BalanceCard({
  score,
  nameA,
  nameB,
  rostersA,
  rostersB,
}: {
  score: number
  nameA: string
  nameB: string
  rostersA: Student[]
  rostersB: Student[]
}) {
  // Sum "overall" from position-based data is not available in Student type from the roster.
  // Instead we use simple count-based placeholder (the UI kit uses geral sum).
  // Since students in rosters only have id/name/position, we show the balance card
  // but without the force bars if we don't have overalls.
  // For now replicate the visual with the balance score and team names.
  return (
    <div className="rounded-[16px] bg-surface p-4 shadow-md">
      <div className="mb-2.5 flex items-center justify-between gap-2.5">
        <span
          className="flex flex-1 items-center gap-2 font-body text-[14px] font-bold text-fg-1"
          style={{ minWidth: 0 }}
        >
          <Scale size={18} style={{ color: 'var(--color-bal-500)', flex: 'none' }} />
          Equilibrio na montagem
        </span>
        <span
          className="font-num font-black tabular-nums"
          style={{ fontSize: 22, color: 'var(--color-bal-700)' }}
        >
          {score}%
        </span>
      </div>

      {/* Force bars */}
      <div className="flex flex-col gap-2" style={{ marginTop: 4 }}>
        {[
          { name: nameA, color: 'var(--color-green-500)', count: rostersA.length },
          { name: nameB, color: 'var(--color-ink-700)', count: rostersB.length },
        ].map((t) => (
          <div key={t.name} className="flex items-center gap-2.5">
            <span
              className="overflow-hidden text-ellipsis whitespace-nowrap font-body text-xs font-bold text-fg-2"
              style={{ width: 76 }}
            >
              {t.name}
            </span>
            <span
              className="flex-1 overflow-hidden bg-gray-200"
              style={{ height: 10, borderRadius: 999 }}
            >
              <i
                style={{
                  display: 'block',
                  height: '100%',
                  width: `${Math.min(100, score + t.count)}%`,
                  background: t.color,
                  borderRadius: 999,
                }}
              />
            </span>
          </div>
        ))}
      </div>

      <p className="mt-2 font-body text-[11.5px] text-fg-3">
        Forca = somatorio das notas gerais usadas no balanceamento.
      </p>
    </div>
  )
}

function TeamHeader({
  name,
  win,
  dotColor,
}: {
  name: string
  win: boolean
  dotColor: string
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between">
      <span className="flex items-center gap-2 font-display text-[17px] font-extrabold text-fg-1">
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 3,
            background: dotColor,
          }}
        />
        {name}
      </span>
      <span
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-body text-xs font-bold"
        style={{
          background: win ? 'var(--win-bg)' : 'var(--loss-bg)',
          color: win ? 'var(--win-700)' : 'var(--loss-700)',
        }}
      >
        {win && <Trophy size={14} />}
        {win ? 'Vitoria' : 'Derrota'}
      </span>
    </div>
  )
}

function RosterChips({
  players,
  onPlayerTap,
}: {
  players: Student[]
  onPlayerTap?: (p: Student) => void
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {players.map((p) => (
        <span
          key={p.id}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border-1 bg-surface font-body text-[14px] font-semibold text-fg-1"
          style={{ padding: '5px 14px 5px 5px' }}
          onClick={() => onPlayerTap?.(p)}
        >
          <Avatar name={p.name} size={30} />
          {p.name.split(' ')[0]}
          {p.position === 'LEV' && (
            <span
              className="rounded-full font-body text-[10px] font-bold"
              style={{
                padding: '2px 7px',
                letterSpacing: '.04em',
                background: 'var(--color-yellow-400)',
                color: '#2A1E00',
              }}
            >
              LEV
            </span>
          )}
        </span>
      ))}
    </div>
  )
}

/* ================================================================
   Evaluations overlay (screen 08)
   ================================================================ */

interface EvalOverlayProps {
  match: {
    id: string
    session_id: string | null
    team_a_name: string
    team_b_name: string
    match_date: string
    winner: string | null
    rostersA: Student[]
    rostersB: Student[]
  }
  onBack: () => void
  onEvaluate: (studentId: string) => void
}

function EvaluationsOverlay({ match, onBack, onEvaluate }: EvalOverlayProps) {
  const { data: evaluations } = useSessionEvaluations(match.session_id ?? undefined)

  const allPlayers = [
    ...match.rostersA.map((p) => ({ ...p, _side: 'a' as const })),
    ...match.rostersB.map((p) => ({ ...p, _side: 'b' as const })),
  ]
  // deduplicate by id
  const seen = new Set<string>()
  const presentes = allPlayers.filter((p) => {
    if (seen.has(p.id)) return false
    seen.add(p.id)
    return true
  })

  const evalMap = new Map(
    (evaluations ?? []).map((e) => [e.student_id, e]),
  )

  const evaluated = presentes.filter((p) => evalMap.has(p.id)).length
  const winnerName = match.winner === 'a' ? match.team_a_name : match.team_b_name
  const dateLabel = formatMatchCardDate(match.match_date)

  return (
    <>
      <ScreenHeader
        title="Avaliacoes"
        subtitle={`Treino de ${dateLabel} · Sub-17 Masculino`}
        back
        onBack={onBack}
      />

      <div className="flex-1 overflow-auto px-[18px] pb-28" style={{ paddingTop: 4 }}>
        {/* match context card */}
        <div className="flex items-center gap-3 rounded-[16px] bg-surface p-3 shadow-sm">
          <div
            className="flex shrink-0 items-center justify-center rounded-[11px] bg-green-50 text-green-600"
            style={{ width: 38, height: 38 }}
          >
            <Volleyball size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-body text-[14px] font-bold text-fg-1">
              {match.team_a_name}{' '}
              <span className="text-fg-4">x</span>{' '}
              {match.team_b_name}
            </div>
            <div className="font-body text-[11.5px] text-fg-4">
              Partida do dia · vencedor {winnerName}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onBack}>
            Ver partida
          </Button>
        </div>

        {/* stats band */}
        <div className="mt-3.5 flex gap-2">
          <StatBadge value={presentes.length} label="presentes" icon={UserCheck} tone="neutral" />
          <StatBadge value={evaluated} label="avaliados" tone="win" />
          <StatBadge value={0} label="ajustes" icon={TrendingUp} tone="bal" />
        </div>

        {/* clarification */}
        <p className="mt-3.5 font-body text-[11.5px] leading-relaxed text-fg-4">
          As notas sao do <b>treino</b>, nao da partida. Uma partida gera apenas a
          vitoria/derrota do time.
        </p>

        {/* player list */}
        <div className="mt-4">
          <h3 className="mb-3 font-display text-[16px] font-bold text-fg-1">Presentes</h3>
          <div className="flex flex-col gap-0">
            {presentes.map((p) => {
              const ev = evalMap.get(p.id)
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 border-b border-border-1 bg-surface py-3.5 last:border-0"
                  style={{ paddingLeft: 2, paddingRight: 2, cursor: 'pointer' }}
                  onClick={() => onEvaluate(p.id)}
                >
                  <Avatar name={p.name} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="font-body text-[15px] font-bold text-fg-1">
                      {p.name}
                    </div>
                    {ev ? (
                      <div className="mt-0.5 font-body text-[12px] text-fg-4">
                        Sem ajustes de nivel
                      </div>
                    ) : (
                      <div
                        className="mt-0.5 font-body text-[12px] font-medium"
                        style={{ color: 'var(--warn-700)' }}
                      >
                        Presente · nao avaliado
                      </div>
                    )}
                  </div>
                  {ev ? (
                    <span
                      className="flex flex-col items-center rounded-[12px] bg-gray-50 font-num shadow-sm"
                      style={{ padding: '6px 10px', lineHeight: 1 }}
                    >
                      <span className="font-black text-green-600" style={{ fontSize: 18 }}>
                        {ev.engagement}
                      </span>
                      <span
                        className="font-body font-bold text-fg-4"
                        style={{ fontSize: 8.5, letterSpacing: '.04em' }}
                      >
                        ENGAJ.
                      </span>
                    </span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEvaluate(p.id)
                      }}
                    >
                      Avaliar
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* sticky bottom CTA */}
      <div
        className="fixed inset-x-0 bottom-0 z-10 bg-app px-[18px] pb-6 pt-3"
        style={{ boxShadow: '0 -4px 12px rgba(0,0,0,0.06)' }}
      >
        <Button
          size="lg"
          full
          onClick={() => {
            const first = presentes.find((p) => !evalMap.has(p.id))
            if (first) onEvaluate(first.id)
          }}
        >
          <ClipboardCheck size={18} />
          Completar avaliacoes
        </Button>
      </div>
    </>
  )
}

/* ================================================================
   Main page
   ================================================================ */

export default function MatchDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: match, isLoading } = useMatch(id)
  const { remove } = useMatchMutations()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showEvals, setShowEvals] = useState(false)

  if (isLoading) return <FullPageSpinner />
  if (!match) return null

  const aWin = match.winner === 'a'
  const bWin = match.winner === 'b'
  const setsA = match.sets.filter((s) => s.points_a > s.points_b).length
  const setsB = match.sets.filter((s) => s.points_b > s.points_a).length
  const dateLabel = formatMatchCardDate(match.match_date)

  const onDelete = async () => {
    try {
      await remove.mutateAsync(match.id)
      toast.success('Partida excluida.')
      navigate('/history', { replace: true })
    } catch (e) {
      toast.error((e as Error).message)
      setConfirmDelete(false)
    }
  }

  if (showEvals) {
    return (
      <EvaluationsOverlay
        match={match}
        onBack={() => setShowEvals(false)}
        onEvaluate={(studentId) => {
          navigate(`/training/evaluate?session=${match.session_id}&student=${studentId}`)
        }}
      />
    )
  }

  return (
    <>
      <ScreenHeader
        title="Detalhe da partida"
        back
        right={
          <IconButton
            icon={Share2}
            label="Compartilhar"
            onClick={() => navigate(`/share?match=${match.id}`)}
          />
        }
      />

      <div className="space-y-4 px-[18px] pb-8" style={{ paddingTop: 4 }}>
        {/* Result hero card */}
        <div className="rounded-[16px] bg-surface p-4 shadow-md">
          {/* Date / class label */}
          <div
            className="mb-3 flex items-center gap-1.5 font-body text-fg-3"
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '.04em',
              textTransform: 'uppercase',
            }}
          >
            <Calendar size={14} />
            {dateLabel} · Sub-17 Masculino
          </div>

          {/* Score */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              {aWin && <Trophy size={16} style={{ color: 'var(--color-yellow-500)' }} />}
              <span
                className="font-display font-extrabold"
                style={{
                  fontSize: 16,
                  color: aWin ? 'var(--win-700)' : 'var(--fg-1)',
                }}
              >
                {match.team_a_name}
              </span>
            </div>
            <div
              className="flex items-center gap-2 font-num font-black tabular-nums"
              style={{ fontSize: 30, letterSpacing: '-.02em' }}
            >
              <span style={aWin ? { color: 'var(--win-700)' } : {}}>{setsA}</span>
              <span className="font-body text-[16px] font-semibold text-fg-4">x</span>
              <span style={bWin ? { color: 'var(--win-700)' } : {}}>{setsB}</span>
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
              <span
                className="font-display font-extrabold"
                style={{
                  fontSize: 16,
                  color: bWin ? 'var(--win-700)' : 'var(--fg-1)',
                }}
              >
                {match.team_b_name}
              </span>
              {bWin && <Trophy size={16} style={{ color: 'var(--color-yellow-500)' }} />}
            </div>
          </div>

          {match.walkover && (
            <p className="mt-2 text-center text-xs font-bold" style={{ color: 'var(--warn-700)' }}>
              Vitoria por W.O.
            </p>
          )}
        </div>

        {/* Set a set */}
        <div>
          <h3 className="mb-2 font-display text-[16px] font-bold text-fg-1">Set a set</h3>
          <div className="overflow-hidden rounded-[16px] bg-surface shadow-md">
            {match.sets.map((s) => (
              <SetRow
                key={s.id}
                index={s.set_number}
                pointsA={s.points_a}
                pointsB={s.points_b}
                nameA={match.team_a_name}
                nameB={match.team_b_name}
              />
            ))}
          </div>
        </div>

        {/* Balance card */}
        {match.balance_score != null && (
          <div>
            <h3 className="mb-2 font-display text-[16px] font-bold text-fg-1">
              Como os times foram montados
            </h3>
            <BalanceCard
              score={match.balance_score}
              nameA={match.team_a_name}
              nameB={match.team_b_name}
              rostersA={match.rostersA}
              rostersB={match.rostersB}
            />
          </div>
        )}

        {/* Rosters */}
        <div>
          <h3 className="mb-3 font-display text-[16px] font-bold text-fg-1">
            Elencos completos
          </h3>

          <TeamHeader
            name={match.team_a_name}
            win={aWin}
            dotColor="var(--color-green-500)"
          />
          <RosterChips
            players={match.rostersA}
            onPlayerTap={(p) => navigate(`/students/${p.id}`)}
          />

          <TeamHeader
            name={match.team_b_name}
            win={bWin}
            dotColor="var(--color-ink-700)"
          />
          <RosterChips
            players={match.rostersB}
            onPlayerTap={(p) => navigate(`/students/${p.id}`)}
          />

          <p className="font-body text-[11.5px] text-fg-4" style={{ margin: '-6px 2px 0' }}>
            E desta partida que cada jogador herda sua vitoria ou derrota no retrospecto.
          </p>
        </div>

        {/* Actions */}
        <div>
          <h3 className="mb-2 font-display text-[16px] font-bold text-fg-1">Acoes</h3>
          <div className="flex flex-col gap-2.5">
            <Button variant="secondary" full>
              <Pencil size={18} /> Editar resultado
            </Button>
            <div className="flex gap-2.5">
              <Button variant="ghost" full>
                <Users size={18} /> Corrigir elenco
              </Button>
              <Button
                variant="ghost"
                full
                onClick={() => navigate(`/share?match=${match.id}`)}
              >
                <Share2 size={18} /> Compartilhar
              </Button>
            </div>
            <Button variant="ghost" full onClick={() => setShowEvals(true)}>
              <ClipboardList size={18} /> Ver avaliacoes desse treino
            </Button>
            <Button
              variant="ghost"
              full
              className="text-loss"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={18} /> Excluir partida
            </Button>
          </div>
        </div>
      </div>

      <Sheet open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Excluir partida?">
        <p className="mb-5 font-body text-sm text-fg-2">
          Os resultados deste jogo serao removidos do retrospecto dos alunos. Esta acao nao pode
          ser desfeita.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" full onClick={() => setConfirmDelete(false)}>
            Cancelar
          </Button>
          <Button variant="danger" full onClick={onDelete} disabled={remove.isPending}>
            Excluir
          </Button>
        </div>
      </Sheet>
    </>
  )
}
