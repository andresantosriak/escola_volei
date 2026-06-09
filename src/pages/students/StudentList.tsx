import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Search, UserPlus, Users } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { EmptyState } from '@/components/layouts/EmptyState'
import { ScreenHeader } from '@/components/layouts/ScreenHeader'
import { IconButton } from '@/components/layouts/IconButton'
import { FullPageSpinner } from '@/components/ui/spinner'
import { Avatar } from '@/components/students/Avatar'
import { useStudents } from '@/hooks/use-students'
import { useClasses } from '@/hooks/use-classes'
import { supabase } from '@/integrations/supabase/client'
import { POSITIONS, type PositionKey } from '@/lib/constants'

export default function StudentList() {
  const navigate = useNavigate()
  const [teamId, _setTeamId] = useState('')
  const [search, setSearch] = useState('')
  const { data: classes } = useClasses()
  const { data: students, isLoading, isError } = useStudents(teamId || undefined)

  // Fetch match stats (wins/losses) for all students
  const { data: matchStats } = useQuery({
    queryKey: ['student-match-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_student_match_stats')
        .select('student_id, wins, losses')
      if (error) throw new Error(error.message)
      return data
    },
  })

  const statsMap = useMemo(() => {
    const map = new Map<string, { wins: number; losses: number }>()
    for (const s of matchStats ?? []) {
      if (s.student_id) map.set(s.student_id, { wins: s.wins ?? 0, losses: s.losses ?? 0 })
    }
    return map
  }, [matchStats])

  const activeClass = classes?.find((c) => c.id === teamId)
  const subtitle = activeClass
    ? `${activeClass.name} · ${students?.length ?? 0}`
    : `Todas as turmas · ${students?.length ?? 0}`

  const sorted = useMemo(() => {
    if (!students) return []
    let filtered = students
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      filtered = filtered.filter((s) => s.name.toLowerCase().includes(q))
    }
    return [...filtered].sort((a, b) => b.overall - a.overall)
  }, [students, search])

  return (
    <div className="flex flex-col">
      {/* Header */}
      <ScreenHeader
        title="Alunos"
        subtitle={subtitle}
        right={
          <IconButton
            icon={UserPlus}
            label="Adicionar aluno"
            onClick={() => navigate('/students/new')}
          />
        }
      />

      {/* Search bar */}
      <div className="px-[18px]">
        <div className="flex items-center gap-3 rounded-[14px] bg-sunken px-3 py-2.5">
          <Search size={18} className="shrink-0 text-fg-4" />
          <input
            type="text"
            placeholder="Buscar aluno…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 flex-1 border-0 bg-transparent font-body text-[14px] font-medium text-fg-1 placeholder:text-fg-4 focus:outline-none"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-[18px] pb-[calc(var(--bottom-nav-h)+24px)] pt-3">
        {isLoading && <FullPageSpinner label="Carregando alunos…" />}
        {isError && (
          <p className="py-8 text-center text-sm text-loss">Erro ao carregar alunos.</p>
        )}
        {students && students.length === 0 && (
          <EmptyState
            icon={Users}
            title="Nenhum aluno ainda"
            description="Cadastre seu primeiro atleta para montar times e acompanhar a evolução."
            ctaLabel="Novo aluno"
            onCta={() => navigate('/students/new')}
          />
        )}
        {sorted.length > 0 && (
          <div className="flex flex-col gap-[9px]">
            {sorted.map((s) => {
              const stats = statsMap.get(s.id)
              const posLabel = POSITIONS[s.position as PositionKey] ?? s.position ?? 'Sem posição'
              const meta = stats
                ? `${posLabel} · ${stats.wins}V ${stats.losses}D`
                : posLabel

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => navigate(`/students/${s.id}`)}
                  className="flex w-full items-center gap-3 rounded-[14px] bg-surface px-3 py-2.5 text-left shadow-sm transition-transform active:scale-[0.99]"
                >
                  <Avatar name={s.name} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-body text-[15px] font-bold text-fg-1">
                      {s.name || 'Sem nome'}
                    </div>
                    <div className="text-[11.5px] text-fg-4">{meta}</div>
                  </div>
                  <span className="font-num text-[22px] font-black text-green-600">
                    {s.overall}
                  </span>
                  <ChevronRight size={20} className="shrink-0 text-fg-4" />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
