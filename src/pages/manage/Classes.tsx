import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Plus, Clock } from 'lucide-react'
import { Header } from '@/components/layouts/Header'
import { EmptyState } from '@/components/layouts/EmptyState'
import { FullPageSpinner } from '@/components/ui/spinner'
import { ListRow } from '@/components/manage/ListRow'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { NivelTag } from '@/components/layouts/NivelTag'
import { useClasses } from '@/hooks/use-classes'
import { useBranches } from '@/hooks/use-branches'
import { pluralize } from '@/lib/format'

export default function Classes() {
  const navigate = useNavigate()
  const [branchId, setBranchId] = useState<string>('')
  const { data: branches } = useBranches()
  const { data: classes, isLoading, isError } = useClasses(branchId || undefined)

  return (
    <>
      <Header
        title="Turmas"
        back
        right={
          <Button size="sm" onClick={() => navigate('/manage/classes/new')}>
            <Plus size={18} /> Nova
          </Button>
        }
      />
      <div className="p-4">
        {branches && branches.length > 0 && (
          <div className="mb-4">
            <Select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              placeholder="Todas as filiais"
              options={branches.map((b) => ({ value: b.id, label: b.name }))}
            />
          </div>
        )}

        {isLoading && <FullPageSpinner label="Carregando turmas…" />}
        {isError && <p className="py-8 text-center text-sm text-loss">Erro ao carregar turmas.</p>}
        {classes && classes.length === 0 && (
          <EmptyState
            icon={Users}
            title="Nenhuma turma ainda"
            description="Crie uma turma vinculada a uma filial para começar a cadastrar alunos."
            ctaLabel="Criar turma"
            onCta={() => navigate('/manage/classes/new')}
          />
        )}
        {classes && classes.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {classes.map((c) => (
              <ListRow
                key={c.id}
                title={c.name}
                subtitle={`${c.branch_name ?? ''} · ${pluralize(c.student_count, 'aluno', 'alunos')}`}
                onClick={() => navigate(`/manage/classes/${c.id}`)}
                leading={
                  <div className="flex size-10 items-center justify-center rounded-lg bg-green-50 text-green-500">
                    <Users size={20} />
                  </div>
                }
                trailing={<NivelTag level={c.level} />}
              />
            ))}
          </div>
        )}

        {classes && classes.length > 0 && (
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-fg-4">
            <Clock size={13} /> Toque numa turma para ver alunos e horários
          </p>
        )}
      </div>
    </>
  )
}
