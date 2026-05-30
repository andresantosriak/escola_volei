import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home as HomeIcon, Play, Users } from 'lucide-react'
import { Header } from '@/components/layouts/Header'
import { EmptyState } from '@/components/layouts/EmptyState'
import { FullPageSpinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { NivelTag } from '@/components/layouts/NivelTag'
import { useClasses } from '@/hooks/use-classes'
import { useTraining } from '@/contexts/training-context'
import { pluralize } from '@/lib/format'

export default function Home() {
  const navigate = useNavigate()
  const { data: classes, isLoading } = useClasses()
  const { startTraining } = useTraining()
  const [branchFilter, setBranchFilter] = useState('')
  const [selectedId, setSelectedId] = useState('')

  const visible = (classes ?? []).filter((c) => !c.archived)
  const branches = Array.from(
    new Map(
      visible.filter((c) => c.branch_name).map((c) => [c.branch_name, c.branch_name]),
    ).values(),
  )
  const filtered = branchFilter ? visible.filter((c) => c.branch_name === branchFilter) : visible
  const selected = filtered.find((c) => c.id === selectedId)

  const start = () => {
    if (!selected) return
    startTraining(selected.id, selected.name)
    navigate('/training/attendance')
  }

  if (isLoading) return <FullPageSpinner label="Carregando…" />

  return (
    <>
      <Header title="Início" subtitle="Escolha a turma e inicie o treino" />
      <div className="p-4">
        {visible.length === 0 ? (
          <EmptyState
            icon={HomeIcon}
            title="Nenhuma turma ainda"
            description="Crie uma filial e uma turma para começar a treinar."
            ctaLabel="Criar turma"
            onCta={() => navigate('/manage/classes/new')}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {branches.length > 1 && (
              <Select
                value={branchFilter}
                onChange={(e) => {
                  setBranchFilter(e.target.value)
                  setSelectedId('')
                }}
                placeholder="Todas as filiais"
                options={branches.map((b) => ({ value: b!, label: b! }))}
              />
            )}

            <div className="flex flex-col gap-2">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`flex items-center gap-3 rounded-lg border bg-surface px-4 py-3.5 text-left transition-colors ${
                    selectedId === c.id
                      ? 'border-green-500 ring-2 ring-green-500/20'
                      : 'border-border-1'
                  }`}
                >
                  <div className="flex size-11 items-center justify-center rounded-lg bg-green-50 text-green-500">
                    <Users size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-body text-[15px] font-bold">{c.name}</div>
                    <div className="truncate text-xs text-fg-3">
                      {c.schedule_days || 'Sem horário'} ·{' '}
                      {pluralize(c.student_count, 'aluno', 'alunos')}
                    </div>
                  </div>
                  <NivelTag level={c.level} />
                </button>
              ))}
            </div>

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
                  : `Iniciar treino · ${selected.name}`
                : 'Selecione uma turma'}
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
