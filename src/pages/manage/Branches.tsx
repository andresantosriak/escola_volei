import { useNavigate } from 'react-router-dom'
import { Building2, Plus, Archive } from 'lucide-react'
import { Header } from '@/components/layouts/Header'
import { EmptyState } from '@/components/layouts/EmptyState'
import { FullPageSpinner } from '@/components/ui/spinner'
import { ListRow } from '@/components/manage/ListRow'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useBranches } from '@/hooks/use-branches'

export default function Branches() {
  const navigate = useNavigate()
  const { data: branches, isLoading, isError } = useBranches()

  return (
    <>
      <Header
        title="Filiais"
        back
        right={
          <Button size="sm" onClick={() => navigate('/manage/branches/new')}>
            <Plus size={18} /> Nova
          </Button>
        }
      />
      <div className="p-4">
        {isLoading && <FullPageSpinner label="Carregando filiais…" />}
        {isError && <p className="py-8 text-center text-sm text-loss">Erro ao carregar filiais.</p>}
        {branches && branches.length === 0 && (
          <EmptyState
            icon={Building2}
            title="Nenhuma filial ainda"
            description="Crie sua primeira unidade para organizar turmas e alunos."
            ctaLabel="Criar filial"
            onCta={() => navigate('/manage/branches/new')}
          />
        )}
        {branches && branches.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {branches.map((b) => (
              <ListRow
                key={b.id}
                title={b.name}
                subtitle={b.city || b.address || 'Sem endereço'}
                onClick={() => navigate(`/manage/branches/${b.id}`)}
                leading={
                  <div className="flex size-10 items-center justify-center rounded-lg bg-green-50 text-green-500">
                    <Building2 size={20} />
                  </div>
                }
                trailing={
                  b.archived ? (
                    <Badge tone="warn">
                      <Archive size={12} /> Arquivada
                    </Badge>
                  ) : undefined
                }
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
