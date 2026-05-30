import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Users } from 'lucide-react'
import { Header } from '@/components/layouts/Header'
import { FullPageSpinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/layouts/EmptyState'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/students/Avatar'
import { PresenceToggle } from '@/components/training/PresenceToggle'
import { useTeamRoster } from '@/hooks/use-students'
import { studentService } from '@/services/student-service'
import { useTraining, type TrainingPlayer } from '@/contexts/training-context'
import type { AttendanceStatus, PositionKey } from '@/lib/constants'

export default function Attendance() {
  const navigate = useNavigate()
  const { teamId, teamName, setSession } = useTraining()
  const { data: roster, isLoading } = useTeamRoster(teamId ?? undefined)
  const [status, setStatus] = useState<Record<string, AttendanceStatus>>({})

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
    if (!teamId || !roster) return
    const attendance = roster.map((s) => ({ studentId: s.id, status: status[s.id] ?? 'present' }))
    try {
      const present: TrainingPlayer[] = []
      for (const s of roster) {
        const st = status[s.id] ?? 'present'
        if (st === 'absent') continue
        const full = await studentService.get(s.id)
        present.push({
          id: s.id,
          name: s.name,
          position: (s.position || '') as PositionKey | '',
          alternatePositions: (s.alternate_positions as PositionKey[]) ?? [],
          overall: full.overall,
          skills: full.skills,
          photoUrl: null,
        })
      }
      const { sessionService } = await import('@/services/session-service')
      const session = await sessionService.createWithAttendance(teamId, attendance)
      setSession(session.id, present)
      navigate('/training/teams')
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  if (isLoading) return <FullPageSpinner label="Carregando turma…" />

  if (roster && roster.length === 0) {
    return (
      <>
        <Header title="Chamada" subtitle={teamName ?? undefined} onBack={() => navigate('/')} />
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

  return (
    <>
      <Header
        title="Chamada"
        subtitle={teamName ?? undefined}
        onBack={() => navigate('/')}
        right={
          <span className="rounded-full bg-green-50 px-2.5 py-1 font-stat text-sm font-bold text-green-700">
            {presentCount}/{roster?.length ?? 0}
          </span>
        }
      />
      <div className="p-4 pb-28">
        <div className="flex flex-col gap-2">
          {(roster ?? []).map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 rounded-lg border border-border-1 bg-surface px-3 py-2"
            >
              <Avatar name={s.name} size={36} />
              <span className="min-w-0 flex-1 truncate font-body text-sm font-semibold">{s.name}</span>
              <PresenceToggle
                value={status[s.id] ?? 'present'}
                onChange={(v) => setStatus((prev) => ({ ...prev, [s.id]: v }))}
                compact
              />
            </div>
          ))}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[440px] border-t border-border-1 bg-surface/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur">
        <Button size="lg" full disabled={!canBuild} onClick={goBuild}>
          {canBuild ? 'Montar times' : 'Mínimo de 4 presentes'}
        </Button>
      </div>
    </>
  )
}
