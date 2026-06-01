import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowRight, Users } from 'lucide-react'
import { ScreenHeader } from '@/components/layouts/ScreenHeader'
import { FullPageSpinner, Spinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/layouts/EmptyState'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/students/Avatar'
import { PresenceToggle } from '@/components/training/PresenceToggle'
import { useTeamRoster } from '@/hooks/use-students'
import { studentService } from '@/services/student-service'
import { useTraining, type TrainingPlayer } from '@/contexts/training-context'
import { POSITIONS } from '@/lib/constants'
import type { AttendanceStatus, PositionKey } from '@/lib/constants'

export default function Attendance() {
  const navigate = useNavigate()
  const { teamId, teamName, setSession } = useTraining()
  const { data: roster, isLoading } = useTeamRoster(teamId ?? undefined)
  const [status, setStatus] = useState<Record<string, AttendanceStatus>>({})
  const [building, setBuilding] = useState(false)

  useEffect(() => {
    if (!teamId) navigate('/', { replace: true })
  }, [teamId, navigate])

  useEffect(() => {
    if (roster) {
      setStatus((prev) => {
        const next = { ...prev }
        for (const s of roster) if (!next[s.id]) next[s.id] = 'present'
        return next
      })
    }
  }, [roster])

  const presentCount = useMemo(
    () => Object.values(status).filter((s) => s === 'present' || s === 'late').length,
    [status],
  )

  const canBuild = presentCount >= 4

  const goBuild = async () => {
    if (!teamId || !roster || building) return
    const attendance = roster.map((s) => ({ studentId: s.id, status: status[s.id] ?? 'present' }))
    setBuilding(true)
    try {
      // só os presentes/atrasados entram nos times
      const playing = roster.filter((s) => (status[s.id] ?? 'present') !== 'absent')
      const { sessionService } = await import('@/services/session-service')
      // stats em LOTE (2 queries) + criação da sessão em PARALELO — antes eram 6 queries por aluno em série
      const [stats, session] = await Promise.all([
        studentService.enginePlayers(playing),
        sessionService.createWithAttendance(teamId, attendance),
      ])
      const present: TrainingPlayer[] = playing.map((s) => {
        const e = stats.get(s.id)
        return {
          id: s.id,
          name: s.name,
          position: (s.position || '') as PositionKey | '',
          alternatePositions: (s.alternate_positions as PositionKey[]) ?? [],
          overall: e?.overall ?? 73,
          skills: e?.skills ?? {},
          photoUrl: null,
        }
      })
      setSession(session.id, present)
      navigate('/training/teams')
    } catch (e) {
      toast.error((e as Error).message)
      setBuilding(false)
    }
  }

  if (isLoading) return <FullPageSpinner label="Carregando turma..." />

  if (roster && roster.length === 0) {
    return (
      <>
        <ScreenHeader
          title="Chamada"
          subtitle={teamName ? `${teamName} · hoje` : undefined}
          back
          onBack={() => navigate('/')}
        />
        <div className="p-4">
          <EmptyState
            icon={Users}
            title="Turma sem alunos"
            description="Adicione alunos a esta turma para fazer a chamada e montar os times."
            ctaLabel="Ir para alunos"
            onCta={() => navigate('/students')}
          />
        </div>
      </>
    )
  }

  const total = roster?.length ?? 0

  return (
    <>
      {/* --- Header (bg-app, sem borda) --- */}
      <ScreenHeader
        title="Chamada"
        subtitle={teamName ? `${teamName} · hoje` : undefined}
        back
        onBack={() => navigate('/')}
      />

      {/* --- Counter card --- */}
      <div className="px-[18px]">
        <div
          className="flex items-center justify-between rounded-[16px] bg-surface px-4 py-3 shadow-md"
        >
          <span className="inline-flex items-baseline gap-1.5 font-num font-black">
            <span className="text-[30px] leading-none text-green-600">{presentCount}</span>
            <span className="text-[17px] text-fg-4">/{total}</span>
          </span>
          <span className="font-body text-[13px] font-semibold text-fg-3">confirmados</span>
        </div>
      </div>

      {/* --- Lista de alunos --- */}
      <div className="px-[18px] pt-3.5 pb-28">
        <div className="flex flex-col gap-2.5">
          {(roster ?? []).map((s) => {
            const posLabel = s.position
              ? POSITIONS[s.position as PositionKey] ?? s.position
              : undefined

            return (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-[14px] bg-surface px-3 py-2.5 shadow-sm"
              >
                <Avatar name={s.name} size={40} />

                <div className="min-w-0 flex-1">
                  <div className="truncate font-body text-[15px] font-bold text-fg-1">
                    {s.name}
                  </div>
                  {posLabel && (
                    <div className="font-body text-[11.5px] text-fg-4">{posLabel}</div>
                  )}
                </div>

                <PresenceToggle
                  value={status[s.id] ?? 'present'}
                  onChange={(v) => setStatus((prev) => ({ ...prev, [s.id]: v }))}
                  compact
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* --- CTA fixo --- */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[440px] bg-gradient-to-t from-app from-60% to-transparent px-[18px] pb-[calc(14px+env(safe-area-inset-bottom))] pt-3.5">
        <Button size="lg" full disabled={!canBuild || building} onClick={goBuild}>
          {building ? (
            <>
              <Spinner size={20} className="text-white" />
              Montando times…
            </>
          ) : canBuild ? (
            <>
              <ArrowRight size={22} />
              {`Montar times · ${presentCount}`}
            </>
          ) : (
            'Marque ao menos 4'
          )}
        </Button>
      </div>
    </>
  )
}
