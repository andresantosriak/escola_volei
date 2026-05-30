import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Plus, ArrowUpDown } from 'lucide-react'
import { Header } from '@/components/layouts/Header'
import { EmptyState } from '@/components/layouts/EmptyState'
import { FullPageSpinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Avatar } from '@/components/students/Avatar'
import { useStudents } from '@/hooks/use-students'
import { useClasses } from '@/hooks/use-classes'

type SortKey = 'name' | 'overall'

export default function StudentList() {
  const navigate = useNavigate()
  const [teamId, setTeamId] = useState('')
  const [sort, setSort] = useState<SortKey>('name')
  const { data: classes } = useClasses()
  const { data: students, isLoading, isError } = useStudents(teamId || undefined)

  const sorted = useMemo(() => {
    if (!students) return []
    return [...students].sort((a, b) =>
      sort === 'name' ? a.name.localeCompare(b.name) : b.overall - a.overall,
    )
  }, [students, sort])

  return (
    <>
      <Header
        title="Alunos"
        subtitle="Toque para ver o card"
        right={
          <Button size="sm" onClick={() => navigate('/students/new')}>
            <Plus size={18} /> Novo
          </Button>
        }
      />
      <div className="p-4">
        <div className="mb-4 flex gap-2">
          <Select
            className="flex-1"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            placeholder="Todas as turmas"
            options={(classes ?? []).map((c) => ({ value: c.id, label: c.name }))}
          />
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setSort((s) => (s === 'name' ? 'overall' : 'name'))}
            aria-label="Alternar ordenação"
            title={sort === 'name' ? 'Ordenar por nota' : 'Ordenar por nome'}
          >
            <ArrowUpDown size={18} />
          </Button>
        </div>

        {isLoading && <FullPageSpinner label="Carregando alunos…" />}
        {isError && <p className="py-8 text-center text-sm text-loss">Erro ao carregar alunos.</p>}
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
          <div className="flex flex-col gap-2">
            {sorted.map((s) => (
              <button
                key={s.id}
                onClick={() => navigate(`/students/${s.id}`)}
                className="flex items-center gap-3 rounded-lg border border-border-1 bg-surface px-3.5 py-2.5 text-left transition-colors hover:bg-sunken active:scale-[0.99]"
              >
                <Avatar name={s.name} size={42} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-body text-[15px] font-semibold">{s.name}</div>
                  <div className="text-xs text-fg-3">{s.position || 'Sem posição'}</div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-display text-xl font-extrabold text-green-600">{s.overall}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-fg-4">Geral</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
