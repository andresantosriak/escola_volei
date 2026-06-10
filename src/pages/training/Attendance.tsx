import { useEffect, useMemo, useState } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowRight, UserPlus, Users } from 'lucide-react'
import { ScreenHeader } from '@/components/layouts/ScreenHeader'
import { FullPageSpinner, Spinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/layouts/EmptyState'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { Select } from '@/components/ui/select'
import { Avatar } from '@/components/students/Avatar'
import { Scale5 } from '@/components/students/Scale5'
import { PresenceToggle } from '@/components/training/PresenceToggle'
import { useTeamRoster } from '@/hooks/use-students'
import { studentService } from '@/services/student-service'
import { useTraining, type TrainingPlayer } from '@/contexts/training-context'
import { POSITIONS, POSITION_KEYS } from '@/lib/constants'
import type { AttendanceStatus, PositionKey } from '@/lib/constants'

const POSITION_OPTIONS = [
  { value: '', label: 'Sem posição' },
  ...POSITION_KEYS.map((k) => ({ value: k, label: POSITIONS[k] })),
]

export default function Attendance() {
  const navigate = useNavigate()
  const { teamId, teamName, setSession } = useTraining()
  const { data: roster, isLoading } = useTeamRoster(teamId ?? undefined)
  const [status, setStatus] = useState<Record<string, AttendanceStatus>>({})
  const [building, setBuilding] = useState(false)

  // Guest players added during this attendance session (local-only, not from roster)
  const [guests, setGuests] = useState<TrainingPlayer[]>([])

  // Guest sheet state
  const [sheetOpen, setSheetOpen] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [guestPosition, setGuestPosition] = useState('')
  const [guestLevel, setGuestLevel] = useState(3)
  const [addingGuest, setAddingGuest] = useState(false)

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

  // Combine roster + guests for display
  const allPlayers = useMemo(() => {
    const rosterItems = (roster ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      position: s.position as PositionKey | '',
      isGuest: false as const,
    }))
    const guestItems = guests.map((g) => ({
      id: g.id,
      name: g.name,
      position: g.position as PositionKey | '',
      isGuest: true as const,
    }))
    return [...rosterItems, ...guestItems]
  }, [roster, guests])

  const presentCount = useMemo(
    () => Object.values(status).filter((s) => s === 'present' || s === 'late').length,
    [status],
  )

  const canBuild = presentCount >= 4

  const resetGuestForm = () => {
    setGuestName('')
    setGuestPosition('')
    setGuestLevel(3)
  }

  const handleAddGuest = async () => {
    const trimmed = guestName.trim()
    if (!trimmed) {
      toast.error('Informe o nome do convidado')
      return
    }
    setAddingGuest(true)
    try {
      const guest = await studentService.createGuest({
        name: trimmed,
        position: guestPosition,
        level: guestLevel,
      })
      setGuests((prev) => [...prev, guest])
      setStatus((prev) => ({ ...prev, [guest.id]: 'present' }))
      setSheetOpen(false)
      resetGuestForm()
      toast.success(`${trimmed} adicionado como convidado`)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setAddingGuest(false)
    }
  }

  const goBuild = async () => {
    if (!teamId || !roster || building) return
    const allIds = [...roster.map((s) => s.id), ...guests.map((g) => g.id)]
    const attendance = allIds.map((id) => ({ studentId: id, status: status[id] ?? 'present' }))
    setBuilding(true)
    try {
      // só os presentes/atrasados entram nos times
      const playingRoster = roster.filter((s) => (status[s.id] ?? 'present') !== 'absent')
      const playingGuests = guests.filter((g) => (status[g.id] ?? 'present') !== 'absent')
      const { sessionService } = await import('@/services/session-service')
      // stats em LOTE (2 queries) + criação da sessão em PARALELO — antes eram 6 queries por aluno em série
      const [stats, session] = await Promise.all([
        studentService.enginePlayers(playingRoster),
        sessionService.createWithAttendance(teamId, attendance),
      ])
      const present: TrainingPlayer[] = [
        ...playingRoster.map((s) => {
          const e = stats.get(s.id)
          return {
            id: s.id,
            name: s.name,
            position: (s.position || '') as PositionKey | '',
            alternatePositions: (s.alternate_positions as PositionKey[]) ?? [],
            overall: e?.overall ?? 73,
            skills: e?.skills ?? {},
            isGuest: e?.isGuest ?? false,
            photoUrl: null,
          }
        }),
        // Guests already have full TrainingPlayer data from createGuest
        ...playingGuests,
      ]
      flushSync(() => setSession(session.id, present))
      navigate('/training/teams')
    } catch (e) {
      toast.error((e as Error).message)
      setBuilding(false)
    }
  }

  if (isLoading) return <FullPageSpinner label="Carregando turma..." />

  if (roster && roster.length === 0 && guests.length === 0) {
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

  const total = allPlayers.length

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

      {/* --- Botão adicionar convidado --- */}
      <div className="px-[18px] pt-3">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-border-2 bg-transparent px-4 py-2.5 font-body text-[14px] font-semibold text-fg-3 transition-colors hover:bg-sunken active:scale-[0.98]"
        >
          <UserPlus size={18} />
          Adicionar convidado
        </button>
      </div>

      {/* --- Lista de alunos --- */}
      <div className="px-[18px] pt-3.5 pb-[calc(var(--bottom-nav-h)+112px)]">
        <div className="flex flex-col gap-2.5">
          {allPlayers.map((s) => {
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
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-body text-[15px] font-bold text-fg-1">
                      {s.name}
                    </span>
                    {s.isGuest && (
                      <span className="shrink-0 rounded-full bg-yellow-400 px-1.5 py-0.5 text-[9px] font-bold text-ink-900">
                        Convidado
                      </span>
                    )}
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
      <div className="fixed inset-x-0 bottom-[var(--bottom-nav-h)] z-30 mx-auto max-w-[440px] bg-gradient-to-t from-app from-60% to-transparent px-[18px] pb-[14px] pt-3.5">
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

      {/* --- Sheet: Adicionar convidado --- */}
      <Sheet open={sheetOpen} onClose={() => { setSheetOpen(false); resetGuestForm() }} title="Adicionar convidado">
        <div className="flex flex-col gap-4">
          {/* Nome */}
          <div>
            <label htmlFor="guest-name" className="mb-1.5 block font-body text-[13px] font-semibold text-fg-3">
              Nome
            </label>
            <input
              id="guest-name"
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Nome do convidado"
              autoFocus
              className="flex h-12 w-full rounded-md border border-border-1 bg-surface px-3.5 font-body text-[15px] text-fg-1 placeholder:text-fg-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Posição */}
          <div>
            <label htmlFor="guest-position" className="mb-1.5 block font-body text-[13px] font-semibold text-fg-3">
              Posição
            </label>
            <Select
              id="guest-position"
              value={guestPosition}
              onChange={(e) => setGuestPosition(e.target.value)}
              options={POSITION_OPTIONS}
              placeholder="Sem posição"
            />
          </div>

          {/* Nível */}
          <div>
            <label className="mb-1.5 block font-body text-[13px] font-semibold text-fg-3">
              Nível geral
            </label>
            <Scale5 value={guestLevel} onChange={setGuestLevel} />
          </div>

          {/* Confirmar */}
          <Button
            size="lg"
            full
            disabled={addingGuest || !guestName.trim()}
            onClick={handleAddGuest}
          >
            {addingGuest ? (
              <>
                <Spinner size={20} className="text-white" />
                Adicionando…
              </>
            ) : (
              'Confirmar'
            )}
          </Button>
        </div>
      </Sheet>
    </>
  )
}
