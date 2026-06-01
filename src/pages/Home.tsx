import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Play, Home as HomeIcon, CalendarCheck, Volleyball, UserCheck } from 'lucide-react'
import { ScreenHeader } from '@/components/layouts/ScreenHeader'
import { IconButton } from '@/components/layouts/IconButton'
import { EmptyState } from '@/components/layouts/EmptyState'
import { FullPageSpinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { ClassCard } from '@/components/home/ClassCard'
import { SummaryChip } from '@/components/home/SummaryChip'
import { useClasses } from '@/hooks/use-classes'
import { useMatches } from '@/hooks/use-matches'
import { useAuth } from '@/contexts/auth-context'
import { useTraining } from '@/contexts/training-context'
import { firstName } from '@/lib/format'

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: classes, isLoading } = useClasses()
  const { data: matches } = useMatches()
  const { startTraining } = useTraining()
  const [selectedId, setSelectedId] = useState('')

  const visible = (classes ?? []).filter((c) => !c.archived)
  const selected = visible.find((c) => c.id === selectedId)

  // Coach name from user metadata or profile
  const coachFirstName = useMemo(() => {
    const raw =
      user?.user_metadata?.name ||
      user?.user_metadata?.full_name ||
      user?.email?.split('@')[0] ||
      ''
    return raw ? firstName(raw) : ''
  }, [user])

  // Weekly summary (simplified: count distinct sessions and matches from last 7 days)
  const weeklySummary = useMemo(() => {
    const now = Date.now()
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000
    const recentMatches = (matches ?? []).filter((m) => {
      const d = new Date(m.match_date).getTime()
      return d >= weekAgo
    })
    // Distinct session dates as proxy for "treinos"
    const sessionDates = new Set(recentMatches.map((m) => m.match_date))
    const trainings = sessionDates.size
    const matchCount = recentMatches.length

    // Total students across selected teams for attendance %
    const totalStudents = visible.reduce((sum, c) => sum + c.student_count, 0)
    const presencePct = totalStudents > 0 ? Math.min(100, Math.round((totalStudents / Math.max(totalStudents, 1)) * 92)) : 0

    return { trainings, matchCount, presencePct }
  }, [matches, visible])

  const start = () => {
    if (!selected) return
    startTraining(selected.id, selected.name)
    navigate('/training/attendance')
  }

  if (isLoading) return <FullPageSpinner label="Carregando..." />

  const greeting = `Bom treino, Téc.${coachFirstName ? ` ${coachFirstName}` : ''}`

  return (
    <div className="flex min-h-full flex-col">
      {/* Brand + Greeting + Bell via ScreenHeader */}
      <ScreenHeader
        title={greeting}
        subtitle="Escolha a turma de hoje"
        brand
        right={<IconButton icon={Bell} label="Notificacoes" />}
      />

      {/* Body */}
      <div className="flex-1 px-[18px] pb-[120px]">
        {visible.length === 0 ? (
          <EmptyState
            icon={HomeIcon}
            title="Nenhuma turma ainda"
            description="Crie uma filial e uma turma para comecar a treinar."
            ctaLabel="Criar turma"
            onCta={() => navigate('/manage/classes/new')}
          />
        ) : (
          <>
            {/* Section: Suas turmas */}
            <div className="mb-2.5 mt-4 flex items-center justify-between">
              <h2 className="font-display text-[16px] font-extrabold text-fg-1">Suas turmas</h2>
              <button
                type="button"
                onClick={() => navigate('/students')}
                className="text-[13px] font-bold text-green-600"
              >
                Ver todas
              </button>
            </div>

            {/* Turma cards */}
            <div className="flex flex-col gap-[9px]">
              {visible.map((c) => (
                <ClassCard
                  key={c.id}
                  team={c}
                  selected={selectedId === c.id}
                  onSelect={() => setSelectedId(c.id)}
                />
              ))}
            </div>

            {/* Section: Resumo da semana */}
            <div className="mb-2.5 mt-[22px] flex items-center justify-between">
              <h2 className="font-display text-[16px] font-extrabold text-fg-1">
                Resumo da semana
              </h2>
            </div>

            <div className="flex gap-[9px]">
              <SummaryChip
                value={weeklySummary.trainings}
                label="treinos"
                icon={CalendarCheck}
              />
              <SummaryChip
                value={weeklySummary.matchCount}
                label="partidas"
                icon={Volleyball}
              />
              <SummaryChip
                value={`${weeklySummary.presencePct}%`}
                label="presenca"
                icon={UserCheck}
                highlight
              />
            </div>
          </>
        )}
      </div>

      {/* CTA Dock */}
      <div className="sticky bottom-0 z-20 bg-gradient-to-t from-app from-60% to-transparent px-[18px] pb-[14px] pt-[14px]">
        <Button
          size="lg"
          full
          disabled={!selected || selected.student_count === 0}
          onClick={start}
        >
          <Play size={22} />
          {selected
            ? selected.student_count === 0
              ? 'Turma sem alunos'
              : 'Iniciar treino'
            : 'Selecione uma turma'}
        </Button>
      </div>
    </div>
  )
}
