import { useNavigate } from 'react-router-dom'
import { Building2, Plus } from 'lucide-react'
import { ScreenHeader } from '@/components/layouts/ScreenHeader'
import { IconButton } from '@/components/layouts/IconButton'
import { EmptyState } from '@/components/layouts/EmptyState'
import { FullPageSpinner } from '@/components/ui/spinner'
import { ListRow } from '@/components/manage/ListRow'
import { useBranches } from '@/hooks/use-branches'

export default function Branches() {
  const navigate = useNavigate()
  const { data: branches, isLoading, isError } = useBranches()

  return (
    <>
      <ScreenHeader
        title="Filiais"
        back
        right={
          <IconButton
            icon={Plus}
            label="Nova filial"
            onClick={() => navigate('/manage/branches/new')}
          />
        }
      />
      <div className="px-[18px] pt-1 pb-[calc(var(--bottom-nav-h)+24px)]">
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
            {branches.map((b) => {
              const parts = [b.city, b.address].filter(Boolean)
              const subtitle = parts.length > 0 ? parts.join(' · ') : 'Sem endereço'
              return (
                <ListRow
                  key={b.id}
                  title={b.name}
                  subtitle={subtitle}
                  leadingIcon={Building2}
                  onClick={() => navigate(`/manage/branches/${b.id}`)}
                />
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
