import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Trophy, Trash2, Share2, Scale } from 'lucide-react'
import { Header } from '@/components/layouts/Header'
import { FullPageSpinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { Avatar } from '@/components/students/Avatar'
import { SetScoreRow } from '@/components/history/SetScoreRow'
import { useMatch, useMatchMutations } from '@/hooks/use-matches'
import { formatDateFull } from '@/lib/format'
import type { Student } from '@/types/domain'

function RosterColumn({ title, win, players }: { title: string; win: boolean; players: Student[] }) {
  return (
    <div className="flex-1">
      <div className="mb-2 flex items-center gap-1 font-body text-sm font-bold">
        {win && <Trophy size={15} className="text-yellow-500" />}
        <span className={win ? 'text-green-700' : 'text-fg-1'}>{title}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {players.map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <Avatar name={p.name} size={26} />
            <span className="truncate font-body text-sm">{p.name}</span>
          </div>
        ))}
        {players.length === 0 && <span className="text-xs text-fg-4">—</span>}
      </div>
    </div>
  )
}

export default function MatchDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: match, isLoading } = useMatch(id)
  const { remove } = useMatchMutations()
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (isLoading) return <FullPageSpinner />
  if (!match) return null

  const aWin = match.winner === 'a'
  const bWin = match.winner === 'b'

  const onDelete = async () => {
    try {
      await remove.mutateAsync(match.id)
      toast.success('Partida excluída.')
      navigate('/history', { replace: true })
    } catch (e) {
      toast.error((e as Error).message)
      setConfirmDelete(false)
    }
  }

  return (
    <>
      <Header title="Detalhe da partida" subtitle={formatDateFull(match.match_date)} back />
      <div className="space-y-4 p-4">
        <div className="rounded-lg border border-border-1 bg-surface p-4">
          <div className="flex items-center justify-center gap-3 text-center">
            <span className={`flex-1 font-body text-sm font-bold ${aWin ? 'text-green-700' : ''}`}>
              {match.team_a_name}
            </span>
            <span className="font-stat text-2xl font-bold tabular-nums">
              {match.sets.filter((s) => s.points_a > s.points_b).length} ×{' '}
              {match.sets.filter((s) => s.points_b > s.points_a).length}
            </span>
            <span className={`flex-1 font-body text-sm font-bold ${bWin ? 'text-green-700' : ''}`}>
              {match.team_b_name}
            </span>
          </div>
          {match.walkover && (
            <p className="mt-2 text-center text-xs font-bold text-[#A85A00]">Vitória por W.O.</p>
          )}
        </div>

        <div className="rounded-lg border border-border-1 bg-surface px-4 py-2">
          {match.sets.map((s) => (
            <SetScoreRow key={s.id} index={s.set_number} pointsA={s.points_a} pointsB={s.points_b} />
          ))}
        </div>

        {match.balance_score != null && (
          <div className="flex items-center gap-2 rounded-lg bg-[#E6ECFB] px-3 py-2 text-sm text-ink-700">
            <Scale size={16} />
            Equilíbrio na montagem: <b>{match.balance_score}%</b>
          </div>
        )}

        <div className="flex gap-3 rounded-lg border border-border-1 bg-surface p-4">
          <RosterColumn title={match.team_a_name} win={aWin} players={match.rostersA} />
          <div className="w-px bg-border-1" />
          <RosterColumn title={match.team_b_name} win={bWin} players={match.rostersB} />
        </div>

        <div className="flex flex-col gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate(`/share?match=${match.id}`)}
          >
            <Share2 size={18} /> Compartilhar resultado
          </Button>
          <Button variant="ghost" className="text-loss" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={18} /> Excluir partida
          </Button>
        </div>
      </div>

      <Sheet open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Excluir partida?">
        <p className="mb-5 font-body text-sm text-fg-2">
          Esta ação é irreversível e afeta as estatísticas de vitórias/derrotas dos alunos.
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
